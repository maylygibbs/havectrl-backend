-- Crew iteration 1: document review, schedule publication, experience from the confirmed log.

ALTER TABLE crew.workers
  ADD COLUMN IF NOT EXISTS team text NOT NULL DEFAULT 'operations',
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS uniform_shirt text,
  ADD COLUMN IF NOT EXISTS uniform_pants text,
  ADD COLUMN IF NOT EXISTS uniform_shoes text;

ALTER TABLE crew.worker_documents
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'accepted',
  ADD COLUMN IF NOT EXISTS effective_on date,
  ADD COLUMN IF NOT EXISTS review_note text,
  ADD COLUMN IF NOT EXISTS private_note text,
  ADD COLUMN IF NOT EXISTS supersedes_id uuid;

ALTER TABLE crew.assignments
  ADD COLUMN IF NOT EXISTS publication_status text NOT NULL DEFAULT 'published';

CREATE TABLE IF NOT EXISTS crew.change_requests (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id       uuid NOT NULL REFERENCES crew.assignments (id),
  worker_id           uuid NOT NULL REFERENCES crew.workers (id),
  requested_by        text NOT NULL,
  proposed_activity   text,
  proposed_starts_at  timestamptz,
  proposed_ends_at    timestamptz,
  reason              text NOT NULL,
  status              text NOT NULL DEFAULT 'requested',
  reviewed_by         text,
  review_note         text,
  applied_at          timestamptz,
  deleted_at          timestamptz
);

CREATE TABLE IF NOT EXISTS crew.experience_movements (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id            uuid NOT NULL REFERENCES crew.workers (id),
  source               text NOT NULL,
  source_key           text NOT NULL,
  registration         text,
  function_code        text,
  flight_minutes       integer NOT NULL DEFAULT 0,
  block_minutes        integer NOT NULL DEFAULT 0,
  credited_minutes     integer NOT NULL DEFAULT 0,
  night_minutes        integer NOT NULL DEFAULT 0,
  instrument_minutes   integer NOT NULL DEFAULT 0,
  simulator_minutes    integer NOT NULL DEFAULT 0,
  occurred_on          date,
  counts_as_flight     boolean NOT NULL DEFAULT true,
  deleted_at           timestamptz,
  UNIQUE (worker_id, source, source_key)
);

CREATE TABLE IF NOT EXISTS crew.previous_experience (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id        uuid NOT NULL REFERENCES crew.workers (id),
  origin           text NOT NULL,
  function_code    text,
  registration     text,
  flight_minutes   integer NOT NULL DEFAULT 0,
  as_of            date,
  review_status    text NOT NULL DEFAULT 'pending_review',
  note             text NOT NULL DEFAULT '',
  deleted_at       timestamptz
);

CREATE TABLE IF NOT EXISTS flights.log_crew (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id         uuid NOT NULL REFERENCES flights.flights (id),
  worker_id         uuid NOT NULL REFERENCES crew.workers (id),
  function_code     text NOT NULL DEFAULT 'PIC',
  counts_as_flight  boolean NOT NULL DEFAULT true,
  deleted_at        timestamptz
);

UPDATE crew.workers SET team = 'maintenance'
WHERE position ILIKE '%técn%' OR position ILIKE '%tecn%';

UPDATE crew.workers SET team = 'cabin'
WHERE position ILIKE '%cabina%';

UPDATE crew.workers w
SET email = u.email
FROM identity.users u
WHERE w.email IS NULL AND lower(u.name) = lower(w.full_name);
