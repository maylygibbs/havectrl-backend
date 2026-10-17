CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE configs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_name  text UNIQUE NOT NULL,
  config_data  jsonb NOT NULL,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tenants (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text UNIQUE NOT NULL,
  name       text NOT NULL,
  status     text NOT NULL DEFAULT 'active',
  hostname   text UNIQUE NOT NULL,
  db_name    text NOT NULL,
  db_host    text NOT NULL,
  db_port    integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
