import { BadRequestException, Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { assertModule, canReadSmsFile, profileOf } from '../access';
import { ConfigRegistry } from '../tenancy/config-registry';
import { HaveRequest } from '../tenancy/tenant.middleware';

@Injectable()
export class WorkspaceService {
  constructor(private readonly registry: ConfigRegistry) {}

  private async read<T>(req: HaveRequest, module: string, fn: (db: PoolClient) => Promise<T>) {
    assertModule(req, module);
    const slug = req.tenantSlug;
    if (!slug) throw new BadRequestException('Dominio no registrado');
    return this.registry.withTenant(slug, fn);
  }

  home(req: HaveRequest) {
    return this.read(req, 'home', async (db) => {
      const [flights, aircraft, expenses, reports, inspections] = await Promise.all([
        db.query(`SELECT code, origin, destination, status, flight_date::text AS flight_date FROM flights.flights ORDER BY flight_date, code`),
        db.query(`SELECT registration, model, technical_status FROM aircraft.aircraft ORDER BY registration`),
        db.query(`SELECT count(*)::int AS total FROM ops.expenses WHERE status = 'submitted'`),
        db.query(`SELECT count(*)::int AS total FROM sms.reports WHERE status = 'open'`),
        db.query(`SELECT count(*)::int AS total FROM maint.inspections WHERE status = 'due'`),
      ]);
      const profile = profileOf(req);
      return {
        flights: flights.rows,
        aircraft: aircraft.rows,
        submittedExpenses: expenses.rows[0]?.total ?? 0,
        openReports: canReadSmsFile(profile) ? reports.rows[0]?.total ?? 0 : null,
        dueInspections: inspections.rows[0]?.total ?? 0,
      };
    });
  }

  crew(req: HaveRequest) {
    return this.read(req, 'crew', async (db) => {
      const { rows } = await db.query(
        `SELECT id, employee_code, full_name, position, base, status, license_expires::text AS license_expires
         FROM crew.workers ORDER BY full_name`,
      );
      return rows;
    });
  }

  crewDetail(req: HaveRequest, id: string) {
    return this.read(req, 'crew', async (db) => {
      const worker = await db.query(
        `SELECT id, employee_code, full_name, position, base, status,
                license_number, license_expires::text AS license_expires, medical_expires::text AS medical_expires
         FROM crew.workers WHERE id = $1`,
        [id],
      );
      const assignments = await db.query(
        `SELECT activity, starts_at, ends_at, notes FROM crew.assignments WHERE worker_id = $1 ORDER BY starts_at`,
        [id],
      );
      const experience = await db.query(
        `SELECT category, hours, as_of::text AS as_of FROM crew.experience WHERE worker_id = $1 ORDER BY category`,
        [id],
      );
      return { worker: worker.rows[0] ?? null, assignments: assignments.rows, experience: experience.rows };
    });
  }

  aircraft(req: HaveRequest) {
    return this.read(req, 'aircraft', async (db) => {
      const { rows } = await db.query(
        `SELECT id, registration, model, serial_number, base, technical_status, airframe_hours, airframe_cycles
         FROM aircraft.aircraft ORDER BY registration`,
      );
      return rows;
    });
  }

  aircraftDetail(req: HaveRequest, id: string) {
    return this.read(req, 'aircraft', async (db) => {
      const aircraft = await db.query(`SELECT * FROM aircraft.aircraft WHERE id = $1`, [id]);
      const documents = await db.query(
        `SELECT title, status, expires_on::text AS expires_on FROM aircraft.documents WHERE aircraft_id = $1 ORDER BY title`,
        [id],
      );
      const history = await db.query(
        `SELECT f.code, f.flight_date::text AS flight_date, f.origin, f.destination, f.status, l.flight_minutes, l.review_status
         FROM flights.flights f
         LEFT JOIN flights.logs l ON l.flight_id = f.id
         WHERE f.aircraft_id = $1
         ORDER BY f.flight_date`,
        [id],
      );
      return { aircraft: aircraft.rows[0] ?? null, documents: documents.rows, history: history.rows };
    });
  }

  flights(req: HaveRequest) {
    return this.read(req, 'flights', async (db) => {
      const { rows } = await db.query(
        `SELECT f.id, f.code, a.registration, f.flight_date::text AS flight_date, f.origin, f.destination, f.status, f.eobt,
                p.fpl_status, l.review_status
         FROM flights.flights f
         JOIN aircraft.aircraft a ON a.id = f.aircraft_id
         LEFT JOIN flights.flight_plans p ON p.flight_id = f.id
         LEFT JOIN flights.logs l ON l.flight_id = f.id
         ORDER BY f.flight_date, f.code`,
      );
      return rows;
    });
  }

  flightDetail(req: HaveRequest, id: string) {
    return this.read(req, 'flights', async (db) => {
      const flight = await db.query(
        `SELECT f.id, f.code, a.registration, a.model, f.flight_date::text AS flight_date, f.origin, f.destination, f.status, f.eobt
         FROM flights.flights f JOIN aircraft.aircraft a ON a.id = f.aircraft_id WHERE f.id = $1`,
        [id],
      );
      const plan = await db.query(
        `SELECT profile, identification, route, fpl_status FROM flights.flight_plans WHERE flight_id = $1`,
        [id],
      );
      const log = await db.query(
        `SELECT block_minutes, flight_minutes, cycles, pilot_name, review_status, notes FROM flights.logs WHERE flight_id = $1`,
        [id],
      );
      return { flight: flight.rows[0] ?? null, plan: plan.rows[0] ?? null, log: log.rows[0] ?? null };
    });
  }

  services(req: HaveRequest) {
    return this.read(req, 'operations', async (db) => {
      const { rows } = await db.query(
        `SELECT s.id, f.code AS flight_code, s.kind, s.provider, s.status, s.amount, s.currency
         FROM ops.services s LEFT JOIN flights.flights f ON f.id = s.flight_id
         ORDER BY s.kind`,
      );
      return rows;
    });
  }

  expenses(req: HaveRequest) {
    return this.read(req, 'operations', async (db) => {
      const { rows } = await db.query(
        `SELECT e.id, f.code AS flight_code, e.category, e.description, e.amount, e.currency, e.status, e.author_email
         FROM ops.expenses e LEFT JOIN flights.flights f ON f.id = e.flight_id
         ORDER BY e.category`,
      );
      return rows;
    });
  }

  inspections(req: HaveRequest) {
    return this.read(req, 'maintenance', async (db) => {
      const { rows } = await db.query(
        `SELECT i.id, a.registration, i.title, i.due_date::text AS due_date, i.due_hours, i.status
         FROM maint.inspections i JOIN aircraft.aircraft a ON a.id = i.aircraft_id
         ORDER BY i.due_date NULLS LAST`,
      );
      return rows;
    });
  }

  discrepancies(req: HaveRequest) {
    return this.read(req, 'maintenance', async (db) => {
      const { rows } = await db.query(
        `SELECT d.id, a.registration, d.title, d.description, d.status, d.reported_by
         FROM maint.discrepancies d JOIN aircraft.aircraft a ON a.id = d.aircraft_id
         ORDER BY d.title`,
      );
      return rows;
    });
  }

  workOrders(req: HaveRequest) {
    return this.read(req, 'maintenance', async (db) => {
      const { rows } = await db.query(
        `SELECT w.id, a.registration, w.title, w.status, w.assigned_to
         FROM maint.work_orders w JOIN aircraft.aircraft a ON a.id = w.aircraft_id
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
         JOIN flights.flights f ON f.id = l.flight_id
         JOIN aircraft.aircraft a ON a.id = f.aircraft_id
         ORDER BY f.flight_date`,
      );
      return rows;
    });
  }

  smsReports(req: HaveRequest) {
    return this.read(req, 'sms', async (db) => {
      if (!canReadSmsFile(profileOf(req))) return [];
      const { rows } = await db.query(
        `SELECT id, title, narrative, anonymous, reporter_email, severity, status, created_at
         FROM sms.reports ORDER BY created_at DESC`,
      );
      return rows;
    });
  }

  async createSmsReport(req: HaveRequest, body: { title?: string; narrative?: string; anonymous?: boolean; severity?: string }) {
    const title = body.title?.trim() ?? '';
    const narrative = body.narrative?.trim() ?? '';
    if (!title || !narrative) throw new BadRequestException('Título y relato son obligatorios');
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
        `SELECT id, title, starts_at, agenda, minutes, status FROM comms.meetings ORDER BY starts_at`,
      );
      return rows;
    });
  }

  documents(req: HaveRequest) {
    return this.read(req, 'library', async (db) => {
      const { rows } = await db.query(
        `SELECT id, code, title, category, edition, language, status FROM library.documents ORDER BY code`,
      );
      return rows;
    });
  }

  users(req: HaveRequest) {
    return this.read(req, 'settings', async (db) => {
      const { rows } = await db.query(
        `SELECT u.email, u.name, u.active, p.code AS profile, p.name AS profile_name
         FROM identity.users u
         LEFT JOIN identity.profiles p ON p.id = u.profile_id
         ORDER BY u.email`,
      );
      return rows;
    });
  }
}
