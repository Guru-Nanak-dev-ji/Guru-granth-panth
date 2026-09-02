import crypto from 'node:crypto';

const auditId = () => `aud_${crypto.randomUUID().replaceAll('-', '')}`;
const iso = (value) => value instanceof Date ? value.toISOString() : value;

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: iso(row.created_at),
    disabledAt: row.disabled_at ? iso(row.disabled_at) : null
  };
}

function mapSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: iso(row.created_at),
    lastSeenAt: iso(row.last_seen_at),
    expiresAt: iso(row.expires_at),
    revokedAt: row.revoked_at ? iso(row.revoked_at) : null
  };
}

/**
 * PostgreSQL implementation of the Wave-1 identity repository contract.
 *
 * Safety properties:
 * - accepts an already-created query-capable client; this module never opens a connection;
 * - never accepts or stores raw session bearer tokens, only token digests;
 * - contains no migration/apply behavior;
 * - refuses construction for a live environment until CHAT A explicitly replaces this guard
 *   after production controls, integration tests and deployment evidence exist.
 */
export class PostgresIdentityStore {
  constructor({ db, environment = 'sandbox' } = {}) {
    if (environment === 'live' || environment === 'production') {
      throw new Error('PostgresIdentityStore live mode is not enabled');
    }
    if (!db || typeof db.query !== 'function') {
      throw new Error('postgres_query_client_required');
    }
    this.db = db;
  }

  get kind() { return 'postgres-adapter-sandbox'; }

  async createUser(user) {
    const result = await this.db.query(
      `INSERT INTO kdn_users (id, email, password_hash, created_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [user.id, user.email, user.passwordHash, user.createdAt]
    );
    return result.rowCount === 1;
  }

  async getUserByEmail(email) {
    const result = await this.db.query(
      `SELECT id, email, password_hash, created_at, disabled_at
       FROM kdn_users WHERE email = $1 LIMIT 1`,
      [email]
    );
    return mapUser(result.rows[0]);
  }

  async getUserById(id) {
    const result = await this.db.query(
      `SELECT id, email, password_hash, created_at, disabled_at
       FROM kdn_users WHERE id = $1 LIMIT 1`,
      [id]
    );
    return mapUser(result.rows[0]);
  }

  async userCount() {
    const result = await this.db.query(`SELECT count(*)::int AS count FROM kdn_users`);
    return result.rows[0]?.count ?? 0;
  }

  async createSession(tokenDigest, session) {
    if (!tokenDigest) throw new Error('session_token_digest_required');
    const result = await this.db.query(
      `INSERT INTO kdn_sessions
       (id, user_id, token_digest, created_at, last_seen_at, expires_at, revoked_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, created_at, last_seen_at, expires_at, revoked_at`,
      [session.id, session.userId, tokenDigest, session.createdAt, session.lastSeenAt, session.expiresAt, session.revokedAt ?? null]
    );
    return mapSession(result.rows[0]);
  }

  async getSessionByTokenDigest(tokenDigest) {
    const result = await this.db.query(
      `SELECT id, user_id, created_at, last_seen_at, expires_at, revoked_at
       FROM kdn_sessions WHERE token_digest = $1 LIMIT 1`,
      [tokenDigest]
    );
    return mapSession(result.rows[0]);
  }

  async listSessionsForUser(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, created_at, last_seen_at, expires_at, revoked_at
       FROM kdn_sessions WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows.map(mapSession);
  }

  async activeSessionCount(at = new Date()) {
    const result = await this.db.query(
      `SELECT count(*)::int AS count
       FROM kdn_sessions
       WHERE revoked_at IS NULL AND expires_at > $1`,
      [iso(at)]
    );
    return result.rows[0]?.count ?? 0;
  }

  async touchSession(tokenDigest, at = new Date().toISOString()) {
    const result = await this.db.query(
      `UPDATE kdn_sessions
       SET last_seen_at = $2
       WHERE token_digest = $1
         AND revoked_at IS NULL
         AND expires_at > $2
       RETURNING id`,
      [tokenDigest, iso(at)]
    );
    return result.rowCount === 1;
  }

  async revokeSession(tokenDigest, at = new Date().toISOString()) {
    const result = await this.db.query(
      `UPDATE kdn_sessions
       SET revoked_at = $2
       WHERE token_digest = $1 AND revoked_at IS NULL
       RETURNING id`,
      [tokenDigest, iso(at)]
    );
    return result.rowCount === 1;
  }

  async revokeAllSessions(userId, at = new Date().toISOString()) {
    const result = await this.db.query(
      `UPDATE kdn_sessions
       SET revoked_at = $2
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId, iso(at)]
    );
    return result.rowCount ?? 0;
  }

  async recordAudit(type, { userId = null, sessionId = null, outcome = 'observed', metadata = {} } = {}) {
    const event = {
      id: auditId(), type, userId, sessionId, outcome, metadata, createdAt: new Date().toISOString()
    };
    await this.db.query(
      `INSERT INTO kdn_security_audit
       (id, event_type, user_id, session_id, outcome, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
      [event.id, event.type, event.userId, event.sessionId, event.outcome, JSON.stringify(event.metadata), event.createdAt]
    );
    return event;
  }

  async auditCount() {
    const result = await this.db.query(`SELECT count(*)::int AS count FROM kdn_security_audit`);
    return result.rows[0]?.count ?? 0;
  }
}
