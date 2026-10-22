-- Crew worker documents (language, travel, training, other) — Vol. 02 Data groups.

CREATE TABLE crew.worker_documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id       uuid NOT NULL REFERENCES crew.workers (id),
  category        text NOT NULL,
  title           text NOT NULL,
  document_number text,
  issuer          text,
  expires_on      date,
  status          text NOT NULL DEFAULT 'current',
  deleted_at      timestamptz
);

CREATE INDEX crew_worker_documents_worker_alive_idx
  ON crew.worker_documents (worker_id)
  WHERE deleted_at IS NULL;
