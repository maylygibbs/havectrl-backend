-- Manual operations: fee airport, official payment link, and a payment that settles one obligation.

ALTER TABLE ops.services
  ADD COLUMN IF NOT EXISTS airport text,
  ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS official_url text;

CREATE TABLE IF NOT EXISTS ops.payments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id    uuid REFERENCES ops.services (id),
  expense_id    uuid REFERENCES ops.expenses (id),
  amount        numeric(12,2) NOT NULL CHECK (amount > 0),
  currency      text NOT NULL,
  method        text NOT NULL,
  status        text NOT NULL,
  official_url  text,
  reference     text NOT NULL DEFAULT '',
  author_email  text NOT NULL,
  deleted_at    timestamptz,
  CONSTRAINT ops_payments_one_source CHECK (
    (service_id IS NOT NULL AND expense_id IS NULL)
    OR (service_id IS NULL AND expense_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS ops_payments_alive_idx
  ON ops.payments (id)
  WHERE deleted_at IS NULL;
