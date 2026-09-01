import crypto from 'node:crypto';

const now = () => new Date().toISOString();
const auditId = () => `aud_${crypto.randomUUID().replaceAll('-', '')}`;

/**
 * Sandbox in-memory implementation of the Wave-1 identity repository contract.
 * It is intentionally ephemeral and must never be treated as a live datastore.
 * A PostgreSQL adapter can implement the same methods without changing HTTP routes.
 */
export class MemoryIdentityStore {
  constructor() {
    this.usersByEmail = new Map();
    this.usersById = new Map();
    this.sessionsByToken = new Map();
    this.securityAudit = [];
  }

  get kind() { return 'ephemeral-memory'; }

  createUser(user) {
    if (this.usersByEmail.has(user.email)) return false;
    this.usersByEmail.set(user.email, user);
    this.usersById.set(user.id, user);
    return true;
  }

  getUserByEmail(email) { return this.usersByEmail.get(email) || null; }
  getUserById(id) { return this.usersById.get(id) || null; }
  userCount() { return this.usersByEmail.size; }

  createSession(token, session) {
    this.sessionsByToken.set(token, session);
    return session;
  }

  getSessionByToken(token) { return this.sessionsByToken.get(token) || null; }

  listSessionsForUser(userId) {
    return [...this.sessionsByToken.values()].filter((x) => x.userId === userId);
  }

  activeSessionCount() {
    return [...this.sessionsByToken.values()].filter((x) => !x.revokedAt).length;
  }

  touchSession(token, at = now()) {
    const session = this.sessionsByToken.get(token);
    if (!session || session.revokedAt) return false;
    session.lastSeenAt = at;
    return true;
  }

  revokeSession(token, at = now()) {
    const session = this.sessionsByToken.get(token);
    if (!session || session.revokedAt) return false;
    session.revokedAt = at;
    return true;
  }

  revokeAllSessions(userId, at = now()) {
    let count = 0;
    for (const session of this.sessionsByToken.values()) {
      if (session.userId === userId && !session.revokedAt) {
        session.revokedAt = at;
        count += 1;
      }
    }
    return count;
  }

  recordAudit(type, { userId = null, sessionId = null, outcome = 'observed', metadata = {} } = {}) {
    const event = {
      id: auditId(),
      type,
      userId,
      sessionId,
      outcome,
      metadata: { ...metadata },
      createdAt: now()
    };
    this.securityAudit.push(event);
    return event;
  }

  auditCount() { return this.securityAudit.length; }

  // Exposed for tests/admin tooling only; HTTP API does not publish the audit stream.
  listAuditForTesting() { return this.securityAudit.map((x) => ({ ...x, metadata: { ...x.metadata } })); }
}

export function createIdentityStore({ environment = 'sandbox' } = {}) {
  if (environment === 'live') {
    throw new Error('MemoryIdentityStore refuses live environment');
  }
  return new MemoryIdentityStore();
}
