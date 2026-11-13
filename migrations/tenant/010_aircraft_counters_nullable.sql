-- Unknown airframe time is not stored as zero.

ALTER TABLE aircraft.aircraft
  ALTER COLUMN airframe_hours DROP NOT NULL,
  ALTER COLUMN airframe_cycles DROP NOT NULL;
