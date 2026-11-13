-- Written minutes stay on the meeting. A link is optional and is not a call provider.

ALTER TABLE comms.meetings
  ADD COLUMN IF NOT EXISTS minutes_status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS location_url text;
