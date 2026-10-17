CREATE TABLE branding (
  id            boolean PRIMARY KEY DEFAULT true CHECK (id),
  display_name  text NOT NULL,
  tagline       text NOT NULL DEFAULT '',
  logo_mark     text NOT NULL,
  logo_url      text,
  primary_color text NOT NULL,
  accent_color  text NOT NULL,
  updated_at    timestamptz NOT NULL DEFAULT now()
);
