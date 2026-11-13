-- Flight legs (tramos) for Iteración 1B internal operations.

CREATE TABLE flights.flight_legs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id     uuid NOT NULL REFERENCES flights.flights (id),
  sequence      integer NOT NULL CHECK (sequence > 0),
  origin        text NOT NULL,
  destination   text NOT NULL,
  eet           text,
  deleted_at    timestamptz
);

CREATE UNIQUE INDEX flight_legs_flight_sequence_alive_idx
  ON flights.flight_legs (flight_id, sequence)
  WHERE deleted_at IS NULL;

CREATE INDEX flight_legs_flight_alive_idx
  ON flights.flight_legs (flight_id)
  WHERE deleted_at IS NULL;

-- One leg per existing flight (matches route on flights row).
INSERT INTO flights.flight_legs (flight_id, sequence, origin, destination)
SELECT f.id, 1, f.origin, f.destination
FROM flights.flights f
WHERE f.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM flights.flight_legs l
    WHERE l.flight_id = f.id AND l.deleted_at IS NULL
  );
