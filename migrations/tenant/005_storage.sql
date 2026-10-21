CREATE SCHEMA IF NOT EXISTS storage;

CREATE TABLE storage.files (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module          text NOT NULL,
  entity_id       uuid,
  original_name   text NOT NULL,
  mime_type       text NOT NULL DEFAULT 'application/octet-stream',
  byte_size       bigint NOT NULL CHECK (byte_size >= 0),
  storage_key     text NOT NULL UNIQUE,
  uploaded_by     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX storage_files_module_entity_idx
  ON storage.files (module, entity_id)
  WHERE deleted_at IS NULL;
