import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PoolClient } from 'pg';
import { assertModule, modulesFor, profileOf } from '../access';
import { homeOpenSmsCount, smsInboxRowsAllowed } from '../home-metrics';
import { ConfigRegistry } from '../tenancy/config-registry';
import { HaveRequest } from '../tenancy/tenant.middleware';
import { AircraftDocumentInput, normalizeAircraftDocument } from './aircraft-document.util';
import { CrewInput, mapPgUnique, normalizeCrew } from './crew.util';
import { FlightInput, normalizeFlight } from './flight.util';
import { CompanyInput, normalizeCompany, normalizeProfileCode } from './settings.util';

export type { CrewInput };

@Injectable()
export class WorkspaceService {
  constructor(private readonly registry: ConfigRegistry) {}

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
    return this.read(req, 'crew', async (db) => {
      const { rows } = await db.query(
        `SELECT id, employee_code, full_name, position, base, status, license_expires::text AS license_expires
         FROM crew.workers WHERE deleted_at IS NULL ORDER BY full_name`,
      );
      return rows;
    });
  }

  crewDetail(req: HaveRequest, id: string) {
    return this.read(req, 'crew', async (db) => {
      const worker = await db.query(
        `SELECT id, employee_code, full_name, position, base, status,
                license_number, license_expires::text AS license_expires, medical_expires::text AS medical_expires
         FROM crew.workers WHERE id = $1 AND deleted_at IS NULL`,
        [id],
      );
      if (!worker.rows[0]) throw new NotFoundException('Worker not found');
      const assignments = await db.query(
        `SELECT id, activity, starts_at::text AS starts_at, ends_at::text AS ends_at, notes
         FROM crew.assignments WHERE worker_id = $1 AND deleted_at IS NULL ORDER BY starts_at`,
        [id],
      );
      const experience = await db.query(
        `SELECT id, category, hours, as_of::text AS as_of
         FROM crew.experience WHERE worker_id = $1 AND deleted_at IS NULL ORDER BY category`,
        [id],
      );
      return { ...worker.rows[0], assignments: assignments.rows, experience: experience.rows };
    });
  }

  crewAssignments(req: HaveRequest) {
    return this.read(req, 'crew', async (db) => {
      const { rows } = await db.query(
        `SELECT a.id, a.worker_id, w.full_name, w.employee_code, a.activity,
                a.starts_at::text AS starts_at, a.ends_at::text AS ends_at, a.notes
         FROM crew.assignments a
         JOIN crew.workers w ON w.id = a.worker_id AND w.deleted_at IS NULL
         WHERE a.deleted_at IS NULL
         ORDER BY a.starts_at, w.full_name`,
      );
      return rows;
    });
  }

  createCrewAssignment(
    req: HaveRequest,
    workerId: string,
    body: { activity?: string; startsAt?: string; endsAt?: string; notes?: string },
  ) {
    const activity = body.activity?.trim() ?? '';
    const startsAt = body.startsAt?.trim() ?? '';
    const endsAt = body.endsAt?.trim() ?? '';
    if (!activity || !startsAt || !endsAt) {
      throw new BadRequestException('Activity, start and end are required');
    }
    return this.read(req, 'crew', async (db) => {
      const worker = await db.query(
        `SELECT id FROM crew.workers WHERE id = $1 AND deleted_at IS NULL`,
        [workerId],
      );
      if (!worker.rows[0]) throw new NotFoundException('Worker not found');
      const { rows } = await db.query(
        `INSERT INTO crew.assignments (worker_id, activity, starts_at, ends_at, notes)
         VALUES ($1, $2, $3::timestamptz, $4::timestamptz, $5)
         RETURNING id, worker_id, activity, starts_at::text AS starts_at, ends_at::text AS ends_at, notes`,
        [workerId, activity, startsAt, endsAt, body.notes?.trim() ?? ''],
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
        return rows[0];
      } catch (err) {
        throw mapPgUnique(err, 'Flight code already exists');
      }
    });
  }

  flightDetail(req: HaveRequest, id: string) {
    return this.read(req, 'flights', async (db) => {
      const flight = await db.query(
        `SELECT f.id, f.code, a.registration, a.model, f.flight_date::text AS flight_date, f.origin, f.destination, f.status, f.eobt
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
        `SELECT block_minutes, flight_minutes, cycles, pilot_name, review_status, notes
         FROM flights.logs WHERE flight_id = $1 AND deleted_at IS NULL`,
        [id],
      );
      return { flight: flight.rows[0], plan: plan.rows[0] ?? null, log: log.rows[0] ?? null };
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
