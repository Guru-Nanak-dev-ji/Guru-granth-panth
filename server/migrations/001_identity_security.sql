-- KDN Wave 1 identity/security PostgreSQL schema.
-- Architecture artifact only until CHAT A provisions an isolated environment and applies it.
-- Never share a database/schema between mock, sandbox and live.

BEGIN;

CREATE TABLE IF NOT EXISTS kdn_users (
  id text PRIMARY KEY CHECK (id ~ '^usr_[a-f0-9]{32}$'),
  email text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz,
  CONSTRAINT kdn_users_email_normalized CHECK (email = lower(trim(email)))
);
CREATE UNIQUE INDEX IF NOT EXISTS kdn_users_email_unique ON kdn_users (email);

CREATE TABLE IF NOT EXISTS kdn_sessions (
  id text PRIMARY KEY CHECK (id ~ '^ses_[a-f0-9]{32}$'),
  user_id text NOT NULL REFERENCES kdn_users(id) ON DELETE CASCADE,
  token_digest text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  CHECK (expires_at > created_at)
);
CREATE INDEX IF NOT EXISTS kdn_sessions_user_active_idx
  ON kdn_sessions (user_id, revoked_at, expires_at);

CREATE TABLE IF NOT EXISTS kdn_security_audit (
  id text PRIMARY KEY CHECK (id ~ '^aud_[a-f0-9]{32}$'),
  event_type text NOT NULL,
  user_id text REFERENCES kdn_users(id) ON DELETE SET NULL,
  session_id text REFERENCES kdn_sessions(id) ON DELETE SET NULL,
  outcome text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS kdn_security_audit_user_time_idx
  ON kdn_security_audit (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS kdn_recovery_requests (
  id text PRIMARY KEY CHECK (id ~ '^rec_[a-f0-9]{32}$'),
  user_id text REFERENCES kdn_users(id) ON DELETE CASCADE,
  secret_digest text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  CHECK (expires_at > created_at)
);

COMMIT;
