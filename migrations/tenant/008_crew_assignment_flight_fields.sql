-- Optional flight metadata on manual schedule rows (Vol. 02 Schedule / anexo Selected Flight).

ALTER TABLE crew.assignments
  ADD COLUMN flight_code text,
  ADD COLUMN origin text,
  ADD COLUMN destination text,
  ADD COLUMN aircraft_registration text;
