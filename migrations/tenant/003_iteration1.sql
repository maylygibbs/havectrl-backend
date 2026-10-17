CREATE TABLE identity.profiles (
  id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code  text UNIQUE NOT NULL,
  name  text NOT NULL
);

ALTER TABLE identity.users
  ADD COLUMN profile_id uuid REFERENCES identity.profiles (id);

CREATE SCHEMA crew;
CREATE SCHEMA aircraft;
CREATE SCHEMA flights;
CREATE SCHEMA ops;
CREATE SCHEMA maint;
CREATE SCHEMA sms;
CREATE SCHEMA comms;
CREATE SCHEMA library;

CREATE TABLE crew.workers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code    text UNIQUE NOT NULL,
  full_name        text NOT NULL,
  position         text NOT NULL,
  base             text NOT NULL,
  status           text NOT NULL DEFAULT 'active',
  license_number   text,
  license_expires  date,
  medical_expires  date
);

CREATE TABLE crew.assignments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id   uuid NOT NULL REFERENCES crew.workers (id),
  activity    text NOT NULL,
  starts_at   timestamptz NOT NULL,
  ends_at     timestamptz NOT NULL,
  notes       text NOT NULL DEFAULT ''
);

CREATE TABLE crew.experience (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id   uuid NOT NULL REFERENCES crew.workers (id),
  category    text NOT NULL,
  hours       numeric(8,2) NOT NULL,
  as_of       date NOT NULL
);

CREATE TABLE aircraft.aircraft (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration       text UNIQUE NOT NULL,
  model              text NOT NULL,
  serial_number      text NOT NULL,
  base               text NOT NULL,
  technical_status   text NOT NULL,
  airframe_hours     numeric(10,1) NOT NULL,
  airframe_cycles    integer NOT NULL
);

CREATE TABLE aircraft.documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id   uuid NOT NULL REFERENCES aircraft.aircraft (id),
  title         text NOT NULL,
  status        text NOT NULL,
  expires_on    date
);

CREATE TABLE flights.flights (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text UNIQUE NOT NULL,
  aircraft_id   uuid NOT NULL REFERENCES aircraft.aircraft (id),
  flight_date   date NOT NULL,
  origin        text NOT NULL,
  destination   text NOT NULL,
  status        text NOT NULL,
  eobt          text NOT NULL
);

CREATE TABLE flights.flight_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id       uuid UNIQUE NOT NULL REFERENCES flights.flights (id),
  profile         text NOT NULL DEFAULT 'venezuela',
  identification  text NOT NULL,
  route           text NOT NULL,
  fpl_status      text NOT NULL
);

CREATE TABLE flights.logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id       uuid UNIQUE NOT NULL REFERENCES flights.flights (id),
  block_minutes   integer NOT NULL,
  flight_minutes  integer NOT NULL,
  cycles          integer NOT NULL,
  pilot_name      text NOT NULL,
  review_status   text NOT NULL,
  notes           text NOT NULL DEFAULT ''
);

CREATE TABLE ops.services (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id    uuid REFERENCES flights.flights (id),
  kind         text NOT NULL,
  provider     text NOT NULL,
  status       text NOT NULL,
  amount       numeric(12,2) NOT NULL,
  currency     text NOT NULL
);

CREATE TABLE ops.expenses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id     uuid REFERENCES flights.flights (id),
  category      text NOT NULL,
  description   text NOT NULL,
  amount        numeric(12,2) NOT NULL,
  currency      text NOT NULL,
  status        text NOT NULL,
  author_email  text NOT NULL
);

CREATE TABLE maint.inspections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id   uuid NOT NULL REFERENCES aircraft.aircraft (id),
  title         text NOT NULL,
  due_date      date,
  due_hours     numeric(10,1),
  status        text NOT NULL
);

CREATE TABLE maint.discrepancies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id   uuid NOT NULL REFERENCES aircraft.aircraft (id),
  flight_id     uuid REFERENCES flights.flights (id),
  title         text NOT NULL,
  description   text NOT NULL,
  status        text NOT NULL,
  reported_by   text NOT NULL
);

CREATE TABLE maint.work_orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id      uuid NOT NULL REFERENCES aircraft.aircraft (id),
  discrepancy_id   uuid REFERENCES maint.discrepancies (id),
  title            text NOT NULL,
  status           text NOT NULL,
  assigned_to      text NOT NULL
);

CREATE TABLE sms.reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  narrative       text NOT NULL,
  anonymous       boolean NOT NULL DEFAULT false,
  reporter_email  text,
  severity        text NOT NULL,
  status          text NOT NULL DEFAULT 'open',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE comms.meetings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  starts_at   timestamptz NOT NULL,
  agenda      text NOT NULL,
  minutes     text NOT NULL DEFAULT '',
  status      text NOT NULL
);

CREATE TABLE library.documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text UNIQUE NOT NULL,
  title       text NOT NULL,
  category    text NOT NULL,
  edition     text NOT NULL,
  language    text NOT NULL,
  status      text NOT NULL
);
