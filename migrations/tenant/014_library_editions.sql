-- Library editions share a reference. Bookmarks stay with the person who saved them.

ALTER TABLE library.documents
  ADD COLUMN IF NOT EXISTS reference text,
  ADD COLUMN IF NOT EXISTS amendment text NOT NULL DEFAULT '';

UPDATE library.documents
SET reference = code
WHERE reference IS NULL OR btrim(reference) = '';

CREATE TABLE IF NOT EXISTS library.bookmarks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   uuid NOT NULL REFERENCES library.documents (id),
  author_email  text NOT NULL,
  page          integer NOT NULL CHECK (page > 0),
  note          text NOT NULL DEFAULT '',
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS library_bookmarks_author_idx
  ON library.bookmarks (author_email)
  WHERE deleted_at IS NULL;
