-- Soft delete on every tenant data table. Listings exclude deleted_at IS NOT NULL.
-- preferred_language: en (default) | es. Preference lives on the account.

ALTER TABLE identity.users
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'en'
    CHECK (preferred_language IN ('en', 'es'));

ALTER TABLE identity.profiles
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE crew.workers
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE crew.assignments
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE crew.experience
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE aircraft.aircraft
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE aircraft.documents
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE flights.flights
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE flights.flight_plans
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE flights.logs
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE ops.services
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE ops.expenses
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE maint.inspections
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE maint.discrepancies
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE maint.work_orders
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE sms.reports
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE comms.meetings
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE library.documents
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS users_alive_idx ON identity.users (email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS workers_alive_idx ON crew.workers (full_name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS aircraft_alive_idx ON aircraft.aircraft (registration) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS flights_alive_idx ON flights.flights (flight_date, code) WHERE deleted_at IS NULL;
