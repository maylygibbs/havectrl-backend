-- Simple work-order evidence and a corrective action kept apart from the original report.

ALTER TABLE maint.discrepancies
  ADD COLUMN IF NOT EXISTS corrective_action text NOT NULL DEFAULT '';

ALTER TABLE maint.work_orders
  ADD COLUMN IF NOT EXISTS evidence text NOT NULL DEFAULT '';
