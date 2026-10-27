import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PoolClient } from 'pg';
import { assertModule, modulesFor, profileOf } from '../access';
import { homeOpenSmsCount, smsInboxRowsAllowed } from '../home-metrics';
import { ConfigRegistry } from '../tenancy/config-registry';
import { HaveRequest } from '../tenancy/tenant.middleware';
import { AircraftDocumentInput, normalizeAircraftDocument } from './aircraft-document.util';
import { assertAssignmentAllowed, CrewAssignmentInput, normalizeCrewAssignment } from './crew-assignment.util';
import {
  bindVisibility,
  crewVisibility,
  documentValidity,
  experienceReport,
  logMovementMinutes,
  simplePdf,
} from './crew-scope.util';
import { CrewDocumentInput, normalizeCrewDocument } from './crew-document.util';
import { CrewInput, mapPgUnique, normalizeCrew } from './crew.util';
import { FlightLegInput, normalizeFlightLeg } from './flight-leg.util';
import { FlightLogInput, normalizeFlightLog } from './flight-log.util';
import { FlightInput, normalizeFlight } from './flight.util';
import { CompanyInput, normalizeCompany, normalizeProfileCode } from './settings.util';

export type { CrewInput };

@Injectable()
export class WorkspaceService {
  constructor(private readonly registry: ConfigRegistry) {}

  private visibility(req: HaveRequest, startAt: number) {
    const scope = crewVisibility(req.user?.profile, req.user?.sub);
    return bindVisibility(scope.clause, scope.params, startAt);
  }

  private async read<T>(req: HaveRequest, module: string, fn: (db: PoolClient) => Promise<T>) {
    assertModule(req, module);
    const slug = req.tenantSlug;
    if (!slug) throw new BadRequestException('Domain not registered');
    return this.registry.withTenant(slug, fn);
  }

  home(req: HaveRequest) {
    return this.read(req, 'home', async (db) => {
      const modules = new Set(modulesFor(profileOf(req)));
      const [
        flights,
        aircraft,
        crewCount,
        aircraftCount,
        flightsToday,
        servicesOpen,
        inspectionsDue,
        meetingsOpen,
        reportsOpen,
      ] = await Promise.all([
        db.query(
          `SELECT f.code, f.origin, f.destination, f.status, f.eobt,
                  f.flight_date::text AS flight_date, a.registration
           FROM flights.flights f
           JOIN aircraft.aircraft a ON a.id = f.aircraft_id AND a.deleted_at IS NULL
           WHERE f.deleted_at IS NULL
           ORDER BY f.flight_date, f.eobt, f.code`,
        ),
        db.query(
          `SELECT registration, model, technical_status
           FROM aircraft.aircraft WHERE deleted_at IS NULL ORDER BY registration`,
        ),
        db.query(`SELECT count(*)::int AS total FROM crew.workers WHERE deleted_at IS NULL AND status = 'active'`),
        db.query(`SELECT count(*)::int AS total FROM aircraft.aircraft WHERE deleted_at IS NULL`),
        db.query(
          `WITH ops AS (
             SELECT COALESCE(
               (SELECT max(flight_date) FROM flights.flights
                WHERE deleted_at IS NULL AND flight_date <= CURRENT_DATE),
               CURRENT_DATE
             ) AS day
           )
           SELECT count(*)::int AS total
           FROM flights.flights f, ops
           WHERE f.deleted_at IS NULL AND f.flight_date = ops.day`,
        ),
        db.query(
          `SELECT count(*)::int AS total FROM ops.services
           WHERE deleted_at IS NULL AND status IN ('requested', 'confirmed', 'quoted')`,
        ),
        db.query(`SELECT count(*)::int AS total FROM maint.inspections WHERE deleted_at IS NULL AND status = 'due'`),
        db.query(
          `SELECT count(*)::int AS total FROM comms.meetings
           WHERE deleted_at IS NULL AND status IN ('draft', 'scheduled')`,
        ),
        db.query(`SELECT count(*)::int AS total FROM sms.reports WHERE deleted_at IS NULL AND status = 'open'`),
      ]);

      const fleetRows = aircraft.rows as { registration: string; technical_status: string }[];
      const fleet = {
        total: fleetRows.length,
        inService: fleetRows.filter((row) => row.technical_status === 'in_service').length,
        inMaintenance: fleetRows.filter((row) => row.technical_status === 'in_maintenance').length,
        onGround: fleetRows.filter((row) => row.technical_status === 'unavailable').length,
      };

      const activity: { at: string; kind: string; text: string }[] = [];
      for (const flight of flights.rows.slice(0, 3) as {
        code: string;
        status: string;
        origin: string;
        destination: string;
      }[]) {
        activity.push({
          at: new Date().toISOString(),
          kind: 'flight',
          text: `Flight ${flight.code} ${flight.origin} \u2192 ${flight.destination} \u00b7 ${flight.status}`,
        });
      }
      for (const plane of fleetRows.slice(0, 2)) {
        activity.push({
          at: new Date().toISOString(),
          kind: 'aircraft',
          text: `Aircraft status \u00b7 ${plane.registration} \u00b7 ${plane.technical_status}`,
        });
      }

      const profile = profileOf(req);
      const counts: Record<string, number | null> = {};
      if (modules.has('crew')) counts.crew = crewCount.rows[0]?.total ?? 0;
      if (modules.has('aircraft')) counts.aircraft = aircraftCount.rows[0]?.total ?? 0;
      if (modules.has('flights')) counts.flightsToday = flightsToday.rows[0]?.total ?? 0;
      if (modules.has('operations')) counts.serviceRequests = servicesOpen.rows[0]?.total ?? 0;
      if (modules.has('maintenance')) counts.maintenanceDue = inspectionsDue.rows[0]?.total ?? 0;
      if (modules.has('communication')) counts.communication = meetingsOpen.rows[0]?.total ?? 0;
      const smsOpen = homeOpenSmsCount(profile, reportsOpen.rows[0]?.total ?? 0);
      if (smsOpen != null) counts.openSmsReports = smsOpen;

      return {
        counts,
        flights: flights.rows,
        aircraft: aircraft.rows,
        fleet,
        activity,
        systemStatus: {
          level: 'operational',
          message: 'All systems operational. No critical issues reported at this time.',
        },
        // legacy fields kept for older clients
        submittedExpenses: 0,
        openReports: homeOpenSmsCount(profile, reportsOpen.rows[0]?.total ?? 0),
        dueInspections: inspectionsDue.rows[0]?.total ?? 0,
      };
    });
  }

  crew(req: HaveRequest) {
    const visible = this.visibility(req, 1);
    return this.read(req, 'crew', async (db) => {
      const { rows } = await db.query(
        `SELECT w.id, w.employee_code, w.full_name, w.position, w.base, w.team, w.status,
                w.license_expires::text AS license_expires,
                w.medical_expires::text AS medical_expires
         FROM crew.workers w
         WHERE w.deleted_at IS NULL AND ${visible.sql}
         ORDER BY w.full_name`,
        visible.params,
      );
      return rows.map((row) => ({
        ...row,
        medical_fit: row.medical_expires ? String(row.medical_expires) >= new Date().toISOString().slice(0, 10) : null,
      }));
    });
  }

  crewDetail(req: HaveRequest, id: string) {
    const visible = this.visibility(req, 2);
    return this.read(req, 'crew', async (db) => {
      const worker = await db.query(
        `SELECT w.id, w.employee_code, w.full_name, w.position, w.base, w.team, w.email, w.status,
                w.license_number, w.license_expires::text AS license_expires,
                w.medical_expires::text AS medical_expires,
                w.uniform_shirt, w.uniform_pants, w.uniform_shoes
         FROM crew.workers w
         WHERE w.id = $1 AND w.deleted_at IS NULL AND ${visible.sql}`,
        [id, ...visible.params],
      );
      if (!worker.rows[0]) throw new NotFoundException('Worker not found');
      const assignments = await db.query(
        `SELECT id, activity, starts_at::text AS starts_at, ends_at::text AS ends_at, notes,
                flight_code, origin, destination, aircraft_registration, publication_status
         FROM crew.assignments WHERE worker_id = $1 AND deleted_at IS NULL ORDER BY starts_at`,
        [id],
      );
      const changes = await db.query(
        `SELECT id, assignment_id, proposed_activity, proposed_starts_at::text AS proposed_starts_at,
                proposed_ends_at::text AS proposed_ends_at, reason, status, review_note
         FROM crew.change_requests
         WHERE worker_id = $1 AND deleted_at IS NULL
         ORDER BY id`,
        [id],
      );
      const experience = await db.query(
        `SELECT id, category, hours, as_of::text AS as_of
         FROM crew.experience WHERE worker_id = $1 AND deleted_at IS NULL ORDER BY category`,
        [id],
      );
      const documents = await db.query(
        `SELECT id, category, title, document_number, issuer, expires_on::text AS expires_on,
                effective_on::text AS effective_on, status, review_status, review_note, private_note
         FROM crew.worker_documents
         WHERE worker_id = $1 AND deleted_at IS NULL
         ORDER BY category, title`,
        [id],
      );
      const movements = await db.query(
        `SELECT flight_minutes, block_minutes, credited_minutes, night_minutes, instrument_minutes,
                simulator_minutes, occurred_on::text AS occurred_on, counts_as_flight, registration, function_code
         FROM crew.experience_movements
         WHERE worker_id = $1 AND deleted_at IS NULL`,
        [id],
      );
      const previous = await db.query(
        `SELECT id, origin, function_code, registration, flight_minutes, as_of::text AS as_of, review_status, note
         FROM crew.previous_experience
         WHERE worker_id = $1 AND deleted_at IS NULL
         ORDER BY origin`,
        [id],
      );
      const files = await db.query(
        `SELECT id, original_name, mime_type, created_at::text AS created_at
         FROM storage.files
         WHERE deleted_at IS NULL AND module = 'crew' AND entity_id = $1
         ORDER BY created_at DESC`,
        [id],
      );
      const today = new Date().toISOString().slice(0, 10);
      const ownFile = req.user?.profile === 'admin' || req.user?.sub === worker.rows[0].email;
      const docs = documents.rows.map((row) => {
        const validity = documentValidity({
          reviewStatus: String(row.review_status ?? 'accepted'),
          expiresOn: row.expires_on as string | null,
          effectiveOn: row.effective_on as string | null,
          today,
        });
        return {
          ...row,
          validity,
          private_note: ownFile ? row.private_note : null,
        };
      });
      const report = experienceReport({
        today,
        movements: movements.rows.map((row) => ({
          flightMinutes: Number(row.flight_minutes),
          blockMinutes: Number(row.block_minutes),
          creditedMinutes: Number(row.credited_minutes),
          nightMinutes: Number(row.night_minutes),
          instrumentMinutes: Number(row.instrument_minutes),
          simulatorMinutes: Number(row.simulator_minutes),
          occurredOn: row.occurred_on as string | null,
          countsAsFlight: Boolean(row.counts_as_flight),
          registration: row.registration as string | null,
          functionCode: row.function_code as string | null,
        })),
        previous: previous.rows.map((row) => ({
          flightMinutes: Number(row.flight_minutes),
          asOf: row.as_of as string | null,
          reviewStatus: String(row.review_status),
        })),
      });
      return {
        ...worker.rows[0],
        medical_fit: worker.rows[0].medical_expires
          ? String(worker.rows[0].medical_expires) >= today
          : null,
        assignments: assignments.rows,
        changeRequests: changes.rows,
        experience: experience.rows,
        experienceReport: report,
        previousExperience: previous.rows,
        documents: docs,
        files: files.rows,
      };
    });
  }

  createCrewDocument(req: HaveRequest, workerId: string, body: CrewDocumentInput) {
    const data = normalizeCrewDocument(body, true);
    return this.read(req, 'crew', async (db) => {
      const worker = await db.query(`SELECT id FROM crew.workers WHERE id = $1 AND deleted_at IS NULL`, [workerId]);
      if (!worker.rows[0]) throw new NotFoundException('Worker not found');
      const reviewStatus = req.user?.profile === 'admin' ? 'accepted' : 'pending_review';
      const { rows } = await db.query(
        `INSERT INTO crew.worker_documents (
           worker_id, category, title, document_number, issuer, expires_on, effective_on, status, review_status, private_note
         )
         VALUES ($1, $2, $3, $4, $5, $6::date, $7::date, $8, $9, $10)
         RETURNING id, category, title, document_number, issuer, expires_on::text AS expires_on,
                   effective_on::text AS effective_on, status, review_status`,
        [
          workerId,
          data.category,
          data.title,
          data.documentNumber,
          data.issuer,
          data.expiresOn || null,
          data.effectiveOn || null,
          data.status,
          reviewStatus,
          data.category === 'medical' ? data.privateNote : null,
        ],
      );
      return rows[0];
    });
  }

  updateCrewDocument(req: HaveRequest, documentId: string, body: CrewDocumentInput) {
    const data = normalizeCrewDocument(body, false);
    return this.read(req, 'crew', async (db) => {
      const { rows } = await db.query(
        `UPDATE crew.worker_documents SET
           category = COALESCE($2, category),
           title = COALESCE($3, title),
           document_number = COALESCE($4, document_number),
           issuer = COALESCE($5, issuer),
           expires_on = CASE WHEN $6::boolean THEN $7::date ELSE expires_on END,
           effective_on = CASE WHEN $9::boolean THEN $10::date ELSE effective_on END,
           private_note = CASE WHEN $11::boolean THEN $12 ELSE private_note END,
           status = COALESCE($8, status)
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id, category, title, document_number, issuer, expires_on::text AS expires_on, status`,
        [
          documentId,
          data.category || null,
          data.title || null,
          data.documentNumber,
          data.issuer,
          body.expiresOn !== undefined,
          data.expiresOn || null,
          data.status || null,
          body.effectiveOn !== undefined,
          data.effectiveOn || null,
          body.privateNote !== undefined,
          data.category === 'medical' ? data.privateNote : null,
        ],
      );
      if (!rows[0]) throw new NotFoundException('Document not found');
      return rows[0];
    });
  }

  softDeleteCrewDocument(req: HaveRequest, documentId: string) {
    return this.read(req, 'crew', async (db) => {
      const { rows } = await db.query(
        `UPDATE crew.worker_documents SET deleted_at = now()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id`,
        [documentId],
      );
      if (!rows[0]) throw new NotFoundException('Document not found');
      return { ok: true };
    });
  }

  crewAssignments(req: HaveRequest) {
    const visible = this.visibility(req, 1);
    return this.read(req, 'crew', async (db) => {
      const { rows } = await db.query(
        `SELECT a.id, a.worker_id, w.full_name, w.employee_code, w.position, a.activity,
                a.starts_at::text AS starts_at, a.ends_at::text AS ends_at, a.notes,
                a.flight_code, a.origin, a.destination, a.aircraft_registration, a.publication_status
         FROM crew.assignments a
         JOIN crew.workers w ON w.id = a.worker_id AND w.deleted_at IS NULL
         WHERE a.deleted_at IS NULL AND ${visible.sql}
         ORDER BY a.starts_at, w.full_name`,
        visible.params,
      );
      return rows;
    });
  }

  assignableFlights(req: HaveRequest) {
    return this.read(req, 'crew', async (db) => {
      const { rows } = await db.query(
        `SELECT f.code, f.origin, f.destination, a.registration, f.flight_date::text AS flight_date
         FROM flights.flights f
         JOIN aircraft.aircraft a ON a.id = f.aircraft_id AND a.deleted_at IS NULL
         WHERE f.deleted_at IS NULL
         ORDER BY f.flight_date DESC, f.code`,
      );
      return rows;
    });
  }

  createCrewAssignment(
    req: HaveRequest,
    workerId: string,
    body: CrewAssignmentInput,
  ) {
    const data = normalizeCrewAssignment(body);
    const visible = this.visibility(req, 2);
    return this.read(req, 'crew', async (db) => {
      const worker = await db.query(
        `SELECT w.id, w.license_expires::text AS license_expires
         FROM crew.workers w WHERE w.id = $1 AND w.deleted_at IS NULL AND ${visible.sql}`,
        [workerId, ...visible.params],
      );
      if (!worker.rows[0]) throw new NotFoundException('Worker not found');
      const flights = await db.query(
        `SELECT f.code, f.origin, f.destination, a.registration
         FROM flights.flights f
         JOIN aircraft.aircraft a ON a.id = f.aircraft_id AND a.deleted_at IS NULL
         WHERE f.deleted_at IS NULL`,
      );
      const known = flights.rows as { code: string; origin: string; destination: string; registration: string }[];
      const existing = await db.query(
        `SELECT activity, starts_at::text AS starts_at, ends_at::text AS ends_at
         FROM crew.assignments
         WHERE worker_id = $1 AND deleted_at IS NULL`,
        [workerId],
      );
      assertAssignmentAllowed({
        activity: data.activity,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        licenseExpires: (worker.rows[0].license_expires as string | null) ?? null,
        flightCode: data.flightCode,
        knownFlightCodes: known.map((row) => row.code),
        existing: existing.rows.map((row) => ({
          activity: String(row.activity),
          startsAt: String(row.starts_at),
          endsAt: String(row.ends_at),
        })),
      });
      const matched = known.find((row) => row.code === data.flightCode);
      const origin = matched?.origin ?? data.origin;
      const destination = matched?.destination ?? data.destination;
      const aircraftRegistration = matched?.registration ?? data.aircraftRegistration;
      const { rows } = await db.query(
        `INSERT INTO crew.assignments (
           worker_id, activity, starts_at, ends_at, notes,
           flight_code, origin, destination, aircraft_registration, publication_status
         )
         VALUES ($1, $2, $3::timestamptz, $4::timestamptz, $5, $6, $7, $8, $9, 'draft')
         RETURNING id, worker_id, activity, starts_at::text AS starts_at, ends_at::text AS ends_at, notes,
                   flight_code, origin, destination, aircraft_registration, publication_status`,
        [
          workerId,
          data.activity,
          data.startsAt,
          data.endsAt,
          data.notes,
          data.flightCode,
          origin,
          destination,
          aircraftRegistration,
        ],
      );
      return rows[0];
    });
  }

  softDeleteCrewAssignment(req: HaveRequest, assignmentId: string) {
    return this.read(req, 'crew', async (db) => {
      const { rows } = await db.query(
        `UPDATE crew.assignments SET deleted_at = now()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id`,
        [assignmentId],
      );
      if (!rows[0]) throw new NotFoundException('Assignment not found');
      return { ok: true };
    });
  }

  createCrew(req: HaveRequest, body: CrewInput) {
    const data = normalizeCrew(body, true);
    return this.read(req, 'crew', async (db) => {
      try {
        const { rows } = await db.query(
          `INSERT INTO crew.workers
             (employee_code, full_name, position, base, status, license_number, license_expires, medical_expires)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, employee_code, full_name, position, base, status,
                     license_number, license_expires::text AS license_expires, medical_expires::text AS medical_expires`,
          [
            data.employeeCode,
            data.fullName,
            data.position,
            data.base,
            data.status,
            data.licenseNumber,
            data.licenseExpires,
            data.medicalExpires,
          ],
        );
        return rows[0];
      } catch (err) {
        throw mapPgUnique(err, 'Employee code already exists');
      }
    });
  }

  updateCrew(req: HaveRequest, id: string, body: CrewInput) {
    const data = normalizeCrew(body, false);
    return this.read(req, 'crew', async (db) => {
      try {
        const { rows } = await db.query(
          `UPDATE crew.workers SET
             employee_code = COALESCE($2, employee_code),
             full_name = COALESCE($3, full_name),
             position = COALESCE($4, position),
             base = COALESCE($5, base),
             status = COALESCE($6, status),
             license_number = CASE WHEN $7::boolean THEN $8 ELSE license_number END,
             license_expires = CASE WHEN $9::boolean THEN $10::date ELSE license_expires END,
             medical_expires = CASE WHEN $11::boolean THEN $12::date ELSE medical_expires END
           WHERE id = $1 AND deleted_at IS NULL
           RETURNING id, employee_code, full_name, position, base, status,
                     license_number, license_expires::text AS license_expires, medical_expires::text AS medical_expires`,
          [
            id,
            data.employeeCode ?? null,
            data.fullName ?? null,
            data.position ?? null,
            data.base ?? null,
            data.status ?? null,
            body.licenseNumber !== undefined,
            data.licenseNumber ?? null,
            body.licenseExpires !== undefined,
            data.licenseExpires ?? null,
            body.medicalExpires !== undefined,
            data.medicalExpires ?? null,
          ],
        );
        if (!rows[0]) throw new NotFoundException('Worker not found');
        return rows[0];
      } catch (err) {
        if (err instanceof NotFoundException) throw err;
        throw mapPgUnique(err, 'Employee code already exists');
      }
    });
  }

  softDeleteCrew(req: HaveRequest, id: string) {
    return this.read(req, 'crew', async (db) => {
      const { rows } = await db.query(
        `UPDATE crew.workers SET deleted_at = now(), status = 'inactive'
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id, employee_code, full_name, deleted_at`,
        [id],
      );
      if (!rows[0]) throw new NotFoundException('Worker not found');
      await db.query(
        `UPDATE crew.assignments SET deleted_at = now()
         WHERE worker_id = $1 AND deleted_at IS NULL`,
        [id],
      );
      await db.query(
        `UPDATE crew.experience SET deleted_at = now()
         WHERE worker_id = $1 AND deleted_at IS NULL`,
        [id],
      );
      await db.query(
        `UPDATE crew.worker_documents SET deleted_at = now()
         WHERE worker_id = $1 AND deleted_at IS NULL`,
        [id],
      );
      return { ok: true, worker: rows[0] };
    });
  }

  aircraft(req: HaveRequest) {
    return this.read(req, 'aircraft', async (db) => {
      const { rows } = await db.query(
        `SELECT id, registration, model, serial_number, base, technical_status, airframe_hours, airframe_cycles
         FROM aircraft.aircraft WHERE deleted_at IS NULL ORDER BY registration`,
      );
      return rows;
    });
  }

  aircraftDetail(req: HaveRequest, id: string) {
    return this.read(req, 'aircraft', async (db) => {
      const aircraft = await db.query(
        `SELECT * FROM aircraft.aircraft WHERE id = $1 AND deleted_at IS NULL`,
        [id],
      );
      const row = aircraft.rows[0];
      if (!row) throw new NotFoundException('Aircraft not found');
      const documents = await db.query(
        `SELECT id, title, status, expires_on::text AS expiry_date
         FROM aircraft.documents WHERE aircraft_id = $1 AND deleted_at IS NULL ORDER BY title`,
        [id],
      );
      const discrepancies = await db.query(
        `SELECT id, title, status, reported_by, description
         FROM maint.discrepancies
         WHERE aircraft_id = $1 AND deleted_at IS NULL
         ORDER BY title`,
        [id],
      );
      const history = await db.query(
        `SELECT f.id, f.code, f.flight_date::text AS flight_date, f.origin, f.destination, f.status,
                l.flight_minutes, l.review_status
         FROM flights.flights f
         LEFT JOIN flights.logs l ON l.flight_id = f.id AND l.deleted_at IS NULL
         WHERE f.aircraft_id = $1 AND f.deleted_at IS NULL
         ORDER BY f.flight_date DESC, f.code`,
        [id],
      );
      return {
        ...row,
        documents: documents.rows,
        discrepancies: discrepancies.rows,
        flights: history.rows,
      };
    });
  }

  createAircraftDocument(req: HaveRequest, aircraftId: string, body: AircraftDocumentInput) {
    const data = normalizeAircraftDocument(body, true);
    return this.read(req, 'aircraft', async (db) => {
      const ac = await db.query(
        `SELECT id FROM aircraft.aircraft WHERE id = $1 AND deleted_at IS NULL`,
        [aircraftId],
      );
      if (!ac.rows[0]) throw new NotFoundException('Aircraft not found');
      const { rows } = await db.query(
        `INSERT INTO aircraft.documents (aircraft_id, title, status, expires_on)
         VALUES ($1, $2, $3, $4::date)
         RETURNING id, title, status, expires_on::text AS expiry_date`,
        [aircraftId, data.title, data.status, data.expiresOn ?? null],
      );
      return rows[0];
    });
  }

  updateAircraftDocument(req: HaveRequest, documentId: string, body: AircraftDocumentInput) {
    const data = normalizeAircraftDocument(body, false);
    return this.read(req, 'aircraft', async (db) => {
      const { rows } = await db.query(
        `UPDATE aircraft.documents SET
           title = COALESCE($2, title),
           status = COALESCE($3, status),
           expires_on = CASE WHEN $4::boolean THEN $5::date ELSE expires_on END
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id, aircraft_id, title, status, expires_on::text AS expiry_date`,
        [
          documentId,
          data.title ?? null,
          data.status ?? null,
          body.expiresOn !== undefined,
          data.expiresOn ?? null,
        ],
      );
      if (!rows[0]) throw new NotFoundException('Document not found');
      return rows[0];
    });
  }

  softDeleteAircraftDocument(req: HaveRequest, documentId: string) {
    return this.read(req, 'aircraft', async (db) => {
      const { rows } = await db.query(
        `UPDATE aircraft.documents SET deleted_at = now()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id`,
        [documentId],
      );
      if (!rows[0]) throw new NotFoundException('Document not found');
      return { ok: true };
    });
  }

  flights(req: HaveRequest) {
    return this.read(req, 'flights', async (db) => {
      const { rows } = await db.query(
        `SELECT f.id, f.code, a.registration, f.flight_date::text AS flight_date, f.origin, f.destination, f.status, f.eobt,
                p.fpl_status, l.review_status
         FROM flights.flights f
         JOIN aircraft.aircraft a ON a.id = f.aircraft_id AND a.deleted_at IS NULL
         LEFT JOIN flights.flight_plans p ON p.flight_id = f.id AND p.deleted_at IS NULL
         LEFT JOIN flights.logs l ON l.flight_id = f.id AND l.deleted_at IS NULL
         WHERE f.deleted_at IS NULL
         ORDER BY f.flight_date, f.code`,
      );
      return rows;
    });
  }

  createFlight(req: HaveRequest, body: FlightInput) {
    const data = normalizeFlight(body, true);
    return this.read(req, 'flights', async (db) => {
      const ac = await db.query(
        `SELECT id FROM aircraft.aircraft WHERE id = $1 AND deleted_at IS NULL`,
        [data.aircraftId],
      );
      if (!ac.rows[0]) throw new NotFoundException('Aircraft not found');
      try {
        const { rows } = await db.query(
          `INSERT INTO flights.flights (code, aircraft_id, flight_date, origin, destination, status, eobt)
           VALUES ($1, $2, $3::date, $4, $5, $6, $7)
           RETURNING id, code, flight_date::text AS flight_date, origin, destination, status, eobt`,
          [data.code, data.aircraftId, data.flightDate, data.origin, data.destination, data.status, data.eobt],
        );
        const flightId = rows[0].id as string;
        await db.query(
          `INSERT INTO flights.flight_legs (flight_id, sequence, origin, destination)
           VALUES ($1, 1, $2, $3)`,
          [flightId, data.origin, data.destination],
        );
        return rows[0];
      } catch (err) {
        throw mapPgUnique(err, 'Flight code already exists');
      }
    });
  }

  private async assertFlight(db: PoolClient, id: string) {
    const { rows } = await db.query(
      `SELECT id FROM flights.flights WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException('Flight not found');
    return rows[0].id as string;
  }

  flightDetail(req: HaveRequest, id: string) {
    return this.read(req, 'flights', async (db) => {
      const flight = await db.query(
        `SELECT f.id, f.code, f.aircraft_id, a.registration, a.model, f.flight_date::text AS flight_date, f.origin, f.destination, f.status, f.eobt
         FROM flights.flights f
         JOIN aircraft.aircraft a ON a.id = f.aircraft_id AND a.deleted_at IS NULL
         WHERE f.id = $1 AND f.deleted_at IS NULL`,
        [id],
      );
      if (!flight.rows[0]) throw new NotFoundException('Flight not found');
      const plan = await db.query(
        `SELECT profile, identification, route, fpl_status
         FROM flights.flight_plans WHERE flight_id = $1 AND deleted_at IS NULL`,
        [id],
      );
      const log = await db.query(
        `SELECT id, block_minutes, flight_minutes, cycles, pilot_name, review_status, notes
         FROM flights.logs WHERE flight_id = $1 AND deleted_at IS NULL`,
        [id],
      );
      const legs = await db.query(
        `SELECT id, sequence, origin, destination, eet
         FROM flights.flight_legs
         WHERE flight_id = $1 AND deleted_at IS NULL
         ORDER BY sequence`,
        [id],
      );
      return {
        ...flight.rows[0],
        plan: plan.rows[0] ?? null,
        log: log.rows[0] ?? null,
        legs: legs.rows,
      };
    });
  }

  updateFlight(req: HaveRequest, id: string, body: FlightInput) {
    const data = normalizeFlight(body, false);
    return this.read(req, 'flights', async (db) => {
      await this.assertFlight(db, id);
      const fields: string[] = [];
      const values: unknown[] = [];
      let n = 1;
      if (data.code) {
        fields.push(`code = $${n++}`);
        values.push(data.code);
      }
      if (data.aircraftId) {
        fields.push(`aircraft_id = $${n++}`);
        values.push(data.aircraftId);
      }
      if (data.flightDate) {
        fields.push(`flight_date = $${n++}`);
        values.push(data.flightDate);
      }
      if (data.origin) {
        fields.push(`origin = $${n++}`);
        values.push(data.origin);
      }
      if (data.destination) {
        fields.push(`destination = $${n++}`);
        values.push(data.destination);
      }
      if (body.status != null) {
        fields.push(`status = $${n++}`);
        values.push(data.status);
      }
      if (body.eobt != null) {
        fields.push(`eobt = $${n++}`);
        values.push(data.eobt);
      }
      if (!fields.length) throw new BadRequestException('No fields to update');
      values.push(id);
      try {
        const { rows } = await db.query(
          `UPDATE flights.flights SET ${fields.join(', ')}
           WHERE id = $${n} AND deleted_at IS NULL
           RETURNING id, code, flight_date::text AS flight_date, origin, destination, status, eobt`,
          values,
        );
        return rows[0];
      } catch (err) {
        throw mapPgUnique(err, 'Flight code already exists');
      }
    });
  }

  upsertFlightLog(req: HaveRequest, flightId: string, body: FlightLogInput) {
    const data = normalizeFlightLog(body, true);
    return this.read(req, 'flights', async (db) => {
      await this.assertFlight(db, flightId);
      const { rows } = await db.query(
        `INSERT INTO flights.logs (flight_id, block_minutes, flight_minutes, cycles, pilot_name, review_status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (flight_id) DO UPDATE SET
           block_minutes = EXCLUDED.block_minutes,
           flight_minutes = EXCLUDED.flight_minutes,
           cycles = EXCLUDED.cycles,
           pilot_name = EXCLUDED.pilot_name,
           review_status = EXCLUDED.review_status,
           notes = EXCLUDED.notes,
           deleted_at = NULL
         RETURNING id, block_minutes, flight_minutes, cycles, pilot_name, review_status, notes`,
        [
          flightId,
          data.blockMinutes,
          data.flightMinutes,
          data.cycles,
          data.pilotName,
          data.reviewStatus,
          data.notes,
        ],
      );
      await this.syncLogExperience(db, flightId, data);
      return rows[0];
    });
  }

  private async syncLogExperience(
    db: PoolClient,
    flightId: string,
    data: ReturnType<typeof normalizeFlightLog>,
  ) {
    await db.query(`UPDATE flights.log_crew SET deleted_at = now() WHERE flight_id = $1 AND deleted_at IS NULL`, [flightId]);
    const confirmed = data.reviewStatus === 'confirmed' || data.reviewStatus === 'reviewed';
    const flight = await db.query(
      `SELECT f.flight_date::text AS flight_date, a.registration
       FROM flights.flights f
       JOIN aircraft.aircraft a ON a.id = f.aircraft_id
       WHERE f.id = $1`,
      [flightId],
    );
    const occurredOn = flight.rows[0]?.flight_date ?? new Date().toISOString().slice(0, 10);
    const registration = flight.rows[0]?.registration ?? null;
    const crew = [...data.crew];
    if (!crew.length && data.pilotName) {
      const named = await db.query(
        `SELECT id FROM crew.workers WHERE lower(full_name) = lower($1) AND deleted_at IS NULL`,
        [data.pilotName],
      );
      if (named.rows[0]) crew.push({ workerId: String(named.rows[0].id), functionCode: 'PIC', countsAsFlight: true });
    }
    for (const member of crew) {
      if (!member.workerId) continue;
      const functionCode = member.functionCode?.trim() || 'PIC';
      const countsAsFlight = member.countsAsFlight !== false && functionCode.toUpperCase() !== 'PAX';
      await db.query(
        `INSERT INTO flights.log_crew (flight_id, worker_id, function_code, counts_as_flight)
         VALUES ($1, $2, $3, $4)`,
        [flightId, member.workerId, functionCode, countsAsFlight && functionCode.toUpperCase() !== 'SIM'],
      );
      const minutes = logMovementMinutes({
        flightMinutes: data.flightMinutes,
        blockMinutes: data.blockMinutes,
        functionCode,
        countsAsFlight,
      });
      if (!confirmed) {
        await db.query(
          `UPDATE crew.experience_movements SET deleted_at = now()
           WHERE worker_id = $1 AND source = 'daily_log' AND source_key = $2 AND deleted_at IS NULL`,
          [member.workerId, flightId],
        );
        continue;
      }
      await db.query(
        `INSERT INTO crew.experience_movements (
           worker_id, source, source_key, registration, function_code,
           flight_minutes, block_minutes, credited_minutes, simulator_minutes,
           occurred_on, counts_as_flight
         )
         VALUES ($1, 'daily_log', $2, $3, $4, $5, $6, $7, $8, $9::date, $10)
         ON CONFLICT (worker_id, source, source_key) DO UPDATE SET
           registration = EXCLUDED.registration,
           function_code = EXCLUDED.function_code,
           flight_minutes = EXCLUDED.flight_minutes,
           block_minutes = EXCLUDED.block_minutes,
           credited_minutes = EXCLUDED.credited_minutes,
           simulator_minutes = EXCLUDED.simulator_minutes,
           occurred_on = EXCLUDED.occurred_on,
           counts_as_flight = EXCLUDED.counts_as_flight,
           deleted_at = NULL`,
        [
          member.workerId,
          flightId,
          registration,
          functionCode,
          minutes.flightMinutes,
          minutes.blockMinutes,
          minutes.creditedMinutes,
          minutes.simulatorMinutes,
          occurredOn,
          minutes.countsAsFlight,
        ],
      );
    }
  }

  createFlightLeg(req: HaveRequest, flightId: string, body: FlightLegInput) {
    const data = normalizeFlightLeg(body, true);
    return this.read(req, 'flights', async (db) => {
      await this.assertFlight(db, flightId);
      let sequence = data.sequence;
      if (!sequence) {
        const next = await db.query(
          `SELECT COALESCE(MAX(sequence), 0) + 1 AS seq FROM flights.flight_legs
           WHERE flight_id = $1 AND deleted_at IS NULL`,
          [flightId],
        );
        sequence = Number(next.rows[0].seq);
      }
      try {
        const { rows } = await db.query(
          `INSERT INTO flights.flight_legs (flight_id, sequence, origin, destination, eet)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, sequence, origin, destination, eet`,
          [flightId, sequence, data.origin, data.destination, data.eet],
        );
        return rows[0];
      } catch (err) {
        throw mapPgUnique(err, 'Leg sequence already exists for this flight');
      }
    });
  }

  updateFlightLeg(req: HaveRequest, legId: string, body: FlightLegInput) {
    const data = normalizeFlightLeg(body, false);
    return this.read(req, 'flights', async (db) => {
      const fields: string[] = [];
      const values: unknown[] = [];
      let n = 1;
      if (data.origin) {
        fields.push(`origin = $${n++}`);
        values.push(data.origin);
      }
      if (data.destination) {
        fields.push(`destination = $${n++}`);
        values.push(data.destination);
      }
      if (body.eet !== undefined) {
        fields.push(`eet = $${n++}`);
        values.push(data.eet);
      }
      if (data.sequence) {
        fields.push(`sequence = $${n++}`);
        values.push(data.sequence);
      }
      if (!fields.length) throw new BadRequestException('No fields to update');
      values.push(legId);
      try {
        const { rows } = await db.query(
          `UPDATE flights.flight_legs SET ${fields.join(', ')}
           WHERE id = $${n} AND deleted_at IS NULL
           RETURNING id, sequence, origin, destination, eet`,
          values,
        );
        if (!rows[0]) throw new NotFoundException('Leg not found');
        return rows[0];
      } catch (err) {
        throw mapPgUnique(err, 'Leg sequence already exists for this flight');
      }
    });
  }

  softDeleteFlightLeg(req: HaveRequest, legId: string) {
    return this.read(req, 'flights', async (db) => {
      const { rows } = await db.query(
        `UPDATE flights.flight_legs SET deleted_at = now()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id`,
        [legId],
      );
      if (!rows[0]) throw new NotFoundException('Leg not found');
      return { ok: true };
    });
  }

  services(req: HaveRequest) {
    return this.read(req, 'operations', async (db) => {
      const { rows } = await db.query(
        `SELECT s.id, f.code AS flight_code, s.kind, s.provider, s.status, s.amount, s.currency
         FROM ops.services s
         LEFT JOIN flights.flights f ON f.id = s.flight_id AND f.deleted_at IS NULL
         WHERE s.deleted_at IS NULL
         ORDER BY s.kind`,
      );
      return rows;
    });
  }

  expenses(req: HaveRequest) {
    return this.read(req, 'operations', async (db) => {
      const { rows } = await db.query(
        `SELECT e.id, f.code AS flight_code, e.category, e.description, e.amount, e.currency, e.status, e.author_email
         FROM ops.expenses e
         LEFT JOIN flights.flights f ON f.id = e.flight_id AND f.deleted_at IS NULL
         WHERE e.deleted_at IS NULL
         ORDER BY e.category`,
      );
      return rows;
    });
  }

  inspections(req: HaveRequest) {
    return this.read(req, 'maintenance', async (db) => {
      const { rows } = await db.query(
        `SELECT i.id, a.registration, i.title, i.due_date::text AS due_date, i.due_hours, i.status
         FROM maint.inspections i
         JOIN aircraft.aircraft a ON a.id = i.aircraft_id AND a.deleted_at IS NULL
         WHERE i.deleted_at IS NULL
         ORDER BY i.due_date NULLS LAST`,
      );
      return rows;
    });
  }

  discrepancies(req: HaveRequest) {
    return this.read(req, 'maintenance', async (db) => {
      const { rows } = await db.query(
        `SELECT d.id, a.registration, d.title, d.description, d.status, d.reported_by
         FROM maint.discrepancies d
         JOIN aircraft.aircraft a ON a.id = d.aircraft_id AND a.deleted_at IS NULL
         WHERE d.deleted_at IS NULL
         ORDER BY d.title`,
      );
      return rows;
    });
  }

  workOrders(req: HaveRequest) {
    return this.read(req, 'maintenance', async (db) => {
      const { rows } = await db.query(
        `SELECT w.id, a.registration, w.title, w.status, w.assigned_to
         FROM maint.work_orders w
         JOIN aircraft.aircraft a ON a.id = w.aircraft_id AND a.deleted_at IS NULL
         WHERE w.deleted_at IS NULL
         ORDER BY w.title`,
      );
      return rows;
    });
  }

  logReview(req: HaveRequest) {
    return this.read(req, 'maintenance', async (db) => {
      const { rows } = await db.query(
        `SELECT f.code, a.registration, l.pilot_name, l.flight_minutes, l.cycles, l.review_status, l.notes
         FROM flights.logs l
         JOIN flights.flights f ON f.id = l.flight_id AND f.deleted_at IS NULL
         JOIN aircraft.aircraft a ON a.id = f.aircraft_id AND a.deleted_at IS NULL
         WHERE l.deleted_at IS NULL
         ORDER BY f.flight_date`,
      );
      return rows;
    });
  }

  smsReports(req: HaveRequest) {
    return this.read(req, 'sms', async (db) => {
      if (!smsInboxRowsAllowed(profileOf(req))) return [];
      const { rows } = await db.query(
        `SELECT id, title, narrative, anonymous, reporter_email, severity, status, created_at
         FROM sms.reports WHERE deleted_at IS NULL ORDER BY created_at DESC`,
      );
      return rows;
    });
  }

  async createSmsReport(
    req: HaveRequest,
    body: { title?: string; narrative?: string; anonymous?: boolean; severity?: string },
  ) {
    const title = body.title?.trim() ?? '';
    const narrative = body.narrative?.trim() ?? '';
    if (!title || !narrative) throw new BadRequestException('Title and narrative are required');
    const anonymous = Boolean(body.anonymous);
    return this.read(req, 'sms', async (db) => {
      const { rows } = await db.query(
        `INSERT INTO sms.reports (title, narrative, anonymous, reporter_email, severity)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, title, status`,
        [title, narrative, anonymous, anonymous ? null : (req.user?.sub ?? null), body.severity ?? 'medium'],
      );
      return rows[0];
    });
  }

  meetings(req: HaveRequest) {
    return this.read(req, 'communication', async (db) => {
      const { rows } = await db.query(
        `SELECT id, title, starts_at, agenda, minutes, status
         FROM comms.meetings WHERE deleted_at IS NULL ORDER BY starts_at`,
      );
      return rows;
    });
  }

  documents(req: HaveRequest) {
    return this.read(req, 'library', async (db) => {
      const { rows } = await db.query(
        `SELECT id, code, title, category, edition, language, status
         FROM library.documents WHERE deleted_at IS NULL ORDER BY code`,
      );
      return rows;
    });
  }

  companySettings(req: HaveRequest) {
    return this.read(req, 'settings', async (db) => {
      const { rows } = await db.query(
        `SELECT display_name, tagline, primary_color, accent_color, logo_mark
         FROM branding
         LIMIT 1`,
      );
      return rows[0] ?? null;
    });
  }

  updateCompanySettings(req: HaveRequest, body: CompanyInput) {
    const data = normalizeCompany(body);
    return this.read(req, 'settings', async (db) => {
      const { rows } = await db.query(
        `UPDATE branding SET
           display_name = COALESCE($1, display_name),
           tagline = COALESCE($2, tagline),
           primary_color = COALESCE($3, primary_color),
           accent_color = COALESCE($4, accent_color),
           updated_at = now()
         WHERE id = true
         RETURNING display_name, tagline, primary_color, accent_color, logo_mark`,
        [data.displayName ?? null, data.tagline ?? null, data.primaryColor ?? null, data.accentColor ?? null],
      );
      if (!rows[0]) throw new NotFoundException('Company profile not found');
      return rows[0];
    });
  }

  profiles(req: HaveRequest) {
    return this.read(req, 'settings', async (db) => {
      const { rows } = await db.query(
        `SELECT code, name FROM identity.profiles WHERE deleted_at IS NULL ORDER BY name`,
      );
      return rows;
    });
  }

  updateUserProfile(req: HaveRequest, email: string, profileCode: string) {
    const code = normalizeProfileCode(profileCode);
    const target = email.trim();
    if (!target) throw new BadRequestException('email is required');
    return this.read(req, 'settings', async (db) => {
      const profile = await db.query(
        `SELECT id FROM identity.profiles WHERE code = $1 AND deleted_at IS NULL`,
        [code],
      );
      if (!profile.rows[0]) throw new BadRequestException('Unknown profile');
      const { rows } = await db.query(
        `UPDATE identity.users SET profile_id = $2
         WHERE lower(email) = lower($1) AND deleted_at IS NULL
         RETURNING email, name, active, preferred_language`,
        [target, profile.rows[0].id],
      );
      if (!rows[0]) throw new NotFoundException('User not found');
      const joined = await db.query(
        `SELECT u.email, u.name, u.active, u.preferred_language, p.code AS profile, p.name AS profile_name
         FROM identity.users u
         LEFT JOIN identity.profiles p ON p.id = u.profile_id AND p.deleted_at IS NULL
         WHERE lower(u.email) = lower($1)`,
        [target],
      );
      return joined.rows[0];
    });
  }

  users(req: HaveRequest) {
    return this.read(req, 'settings', async (db) => {
      const { rows } = await db.query(
        `SELECT u.email, u.name, u.active, u.preferred_language, p.code AS profile, p.name AS profile_name
         FROM identity.users u
         LEFT JOIN identity.profiles p ON p.id = u.profile_id AND p.deleted_at IS NULL
         WHERE u.deleted_at IS NULL
         ORDER BY u.email`,
      );
      return rows;
    });
  }

  private canPublish(req: HaveRequest) {
    return req.user?.profile === 'admin' || req.user?.profile === 'despachador' || req.user?.profile === 'tecnico';
  }

  reviewCrewDocument(req: HaveRequest, documentId: string, body: { decision?: string; note?: string }) {
    if (req.user?.profile !== 'admin') throw new ForbiddenException('Only an administrator reviews documents');
    const decision = body.decision === 'reject' ? 'rejected' : 'accepted';
    return this.read(req, 'crew', async (db) => {
      const current = await db.query(
        `SELECT id, worker_id, category, effective_on::text AS effective_on
         FROM crew.worker_documents WHERE id = $1 AND deleted_at IS NULL`,
        [documentId],
      );
      if (!current.rows[0]) throw new NotFoundException('Document not found');
      const today = new Date().toISOString().slice(0, 10);
      const effective = current.rows[0].effective_on as string | null;
      let supersedes: string | null = null;
      if (decision === 'accepted' && (!effective || effective <= today)) {
        const previous = await db.query(
          `SELECT id FROM crew.worker_documents
           WHERE worker_id = $1 AND category = $2 AND id <> $3 AND deleted_at IS NULL
             AND review_status = 'accepted'
             AND (effective_on IS NULL OR effective_on <= CURRENT_DATE)
           ORDER BY expires_on DESC NULLS LAST
           LIMIT 1`,
          [current.rows[0].worker_id, current.rows[0].category, documentId],
        );
        supersedes = (previous.rows[0]?.id as string | undefined) ?? null;
        if (supersedes) {
          await db.query(`UPDATE crew.worker_documents SET review_status = 'superseded' WHERE id = $1`, [supersedes]);
        }
      }
      const { rows } = await db.query(
        `UPDATE crew.worker_documents
         SET review_status = $2, review_note = $3, supersedes_id = $4
         WHERE id = $1
         RETURNING id, review_status, review_note`,
        [documentId, decision, body.note?.trim() || null, supersedes],
      );
      return rows[0];
    });
  }

  publishAssignment(req: HaveRequest, assignmentId: string) {
    if (!this.canPublish(req)) throw new ForbiddenException('This profile cannot publish the roster');
    const visible = this.visibility(req, 2);
    return this.read(req, 'crew', async (db) => {
      const current = await db.query(
        `SELECT a.id, a.publication_status
         FROM crew.assignments a
         JOIN crew.workers w ON w.id = a.worker_id
         WHERE a.id = $1 AND a.deleted_at IS NULL AND ${visible.sql}`,
        [assignmentId, ...visible.params],
      );
      if (!current.rows[0]) throw new NotFoundException('Assignment not found');
      const change = await db.query(
        `SELECT id, proposed_activity, proposed_starts_at, proposed_ends_at
         FROM crew.change_requests
         WHERE assignment_id = $1 AND status = 'approved' AND applied_at IS NULL AND deleted_at IS NULL
         ORDER BY id DESC LIMIT 1`,
        [assignmentId],
      );
      const nextStatus = current.rows[0].publication_status === 'published' || change.rows[0] ? 'amended' : 'published';
      if (change.rows[0]) {
        await db.query(
          `UPDATE crew.assignments SET
             activity = COALESCE($2, activity),
             starts_at = COALESCE($3, starts_at),
             ends_at = COALESCE($4, ends_at),
             publication_status = $5
           WHERE id = $1`,
          [
            assignmentId,
            change.rows[0].proposed_activity,
            change.rows[0].proposed_starts_at,
            change.rows[0].proposed_ends_at,
            nextStatus,
          ],
        );
        await db.query(`UPDATE crew.change_requests SET applied_at = now() WHERE id = $1`, [change.rows[0].id]);
      } else {
        await db.query(`UPDATE crew.assignments SET publication_status = $2 WHERE id = $1`, [assignmentId, nextStatus]);
      }
      const { rows } = await db.query(
        `SELECT id, publication_status FROM crew.assignments WHERE id = $1`,
        [assignmentId],
      );
      return rows[0];
    });
  }

  requestAssignmentChange(
    req: HaveRequest,
    assignmentId: string,
    body: { reason?: string; activity?: string; startsAt?: string; endsAt?: string },
  ) {
    const reason = body.reason?.trim() ?? '';
    if (!reason) throw new BadRequestException('A reason is required');
    const visible = this.visibility(req, 2);
    return this.read(req, 'crew', async (db) => {
      const current = await db.query(
        `SELECT a.id, a.worker_id
         FROM crew.assignments a
         JOIN crew.workers w ON w.id = a.worker_id
         WHERE a.id = $1 AND a.deleted_at IS NULL AND ${visible.sql}`,
        [assignmentId, ...visible.params],
      );
      if (!current.rows[0]) throw new NotFoundException('Assignment not found');
      const { rows } = await db.query(
        `INSERT INTO crew.change_requests (
           assignment_id, worker_id, requested_by, proposed_activity, proposed_starts_at, proposed_ends_at, reason
         )
         VALUES ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz, $7)
         RETURNING id, status`,
        [
          assignmentId,
          current.rows[0].worker_id,
          req.user?.sub ?? 'unknown',
          body.activity?.trim() || null,
          body.startsAt || null,
          body.endsAt || null,
          reason,
        ],
      );
      return rows[0];
    });
  }

  reviewChangeRequest(req: HaveRequest, requestId: string, body: { decision?: string; note?: string }) {
    if (!this.canPublish(req)) throw new ForbiddenException('This profile cannot review a change');
    const decision = body.decision === 'reject' ? 'rejected' : body.decision === 'cancel' ? 'cancelled' : 'approved';
    return this.read(req, 'crew', async (db) => {
      const { rows } = await db.query(
        `UPDATE crew.change_requests
         SET status = $2, reviewed_by = $3, review_note = $4
         WHERE id = $1 AND deleted_at IS NULL AND status = 'requested'
         RETURNING id, assignment_id, status`,
        [requestId, decision, req.user?.sub ?? null, body.note?.trim() || null],
      );
      if (!rows[0]) throw new NotFoundException('Change request not found');
      return rows[0];
    });
  }

  addPreviousExperience(
    req: HaveRequest,
    workerId: string,
    body: { origin?: string; flightMinutes?: number; asOf?: string; functionCode?: string; registration?: string; note?: string },
  ) {
    const origin = body.origin?.trim() ?? '';
    const minutes = Number(body.flightMinutes ?? 0);
    if (!origin || !Number.isFinite(minutes) || minutes < 0) {
      throw new BadRequestException('origin and flightMinutes are required');
    }
    const visible = this.visibility(req, 2);
    return this.read(req, 'crew', async (db) => {
      const worker = await db.query(
        `SELECT w.id FROM crew.workers w WHERE w.id = $1 AND w.deleted_at IS NULL AND ${visible.sql}`,
        [workerId, ...visible.params],
      );
      if (!worker.rows[0]) throw new NotFoundException('Worker not found');
      const { rows } = await db.query(
        `INSERT INTO crew.previous_experience (worker_id, origin, function_code, registration, flight_minutes, as_of, note, review_status)
         VALUES ($1, $2, $3, $4, $5, $6::date, $7, $8)
         RETURNING id, origin, flight_minutes, as_of::text AS as_of, review_status`,
        [
          workerId,
          origin,
          body.functionCode?.trim() || null,
          body.registration?.trim() || null,
          Math.round(minutes),
          body.asOf || null,
          body.note?.trim() || '',
          req.user?.profile === 'admin' ? 'accepted' : 'pending_review',
        ],
      );
      return rows[0];
    });
  }

  async crewPdf(req: HaveRequest, workerId: string, kind: string) {
    const detail = await this.crewDetail(req, workerId);
    const name = String(detail.full_name ?? '');
    if (kind === 'schedule') {
      const lines = (detail.assignments as { activity: string; starts_at: string; publication_status: string; flight_code: string | null }[]).map(
        (row) => `${row.publication_status} ${row.starts_at} ${row.activity} ${row.flight_code ?? ''}`,
      );
      return simplePdf(`Schedule ${name}`, lines);
    }
    if (kind === 'experience') {
      const report = detail.experienceReport as {
        flightMinutes: number;
        blockMinutes: number;
        creditedMinutes: number;
        simulatorMinutes: number;
        windows: { months: number; flightMinutes: number }[];
        partialHistory: boolean;
      };
      const lines = [
        `Flight minutes ${report.flightMinutes}`,
        `Block minutes ${report.blockMinutes}`,
        `Credited minutes ${report.creditedMinutes}`,
        `Simulator minutes ${report.simulatorMinutes}`,
        ...report.windows.map((row) => `${row.months} months ${row.flightMinutes}`),
        report.partialHistory ? 'Partial history: undated balance is not spread across months' : 'History dated',
      ];
      return simplePdf(`Experience ${name}`, lines);
    }
    const lines = [
      `${detail.employee_code} ${detail.position} ${detail.base} ${detail.team}`,
      `License ${detail.license_number ?? ''} expires ${detail.license_expires ?? ''}`,
      `Medical fit ${String(detail.medical_fit)}`,
      ...((detail.documents as { category: string; title: string; review_status: string; validity: string }[]) ?? []).map(
        (row) => `${row.category} ${row.title} ${row.review_status} ${row.validity}`,
      ),
    ];
    return simplePdf(`Profile ${name}`, lines);
  }

  setPreferredLanguage(req: HaveRequest, language: string) {
    if (language !== 'en' && language !== 'es') {
      throw new BadRequestException('Language must be en or es');
    }
    const email = req.user?.sub;
    const slug = req.tenantSlug;
    if (!email || !slug) throw new BadRequestException('No session');
    // Available to every signed-in profile (not only Settings admins).
    return this.registry.withTenant(slug, async (db) => {
      const { rows } = await db.query(
        `UPDATE identity.users SET preferred_language = $2
         WHERE lower(email) = lower($1) AND deleted_at IS NULL
         RETURNING email, preferred_language`,
        [email, language],
      );
      if (!rows[0]) throw new NotFoundException('User not found');
      return rows[0];
    });
  }
}
