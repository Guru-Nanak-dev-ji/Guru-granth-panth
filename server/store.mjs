import crypto from 'node:crypto';
import { sessionIsExpired } from './session-token.mjs';

const now = () => new Date().toISOString();
const auditId = () => `aud_${crypto.randomUUID().replaceAll('-', '')}`;

/**
 * Sandbox in-memory implementation of the Wave-1 identity repository contract.
 * It is intentionally ephemeral and must never be treated as a live datastore.
 * Session bearer tokens are never stored raw: callers supply only token digests.
 * A PostgreSQL adapter can implement the same methods without changing HTTP routes.
 */
export class MemoryIdentityStore {
  constructor() {
    this.usersByEmail = new Map();
    this.usersById = new Map();
    this.sessionsByDigest = new Map();
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

  createSession(tokenDigest, session) {
    if (!tokenDigest) throw new Error('session_token_digest_required');
    this.sessionsByDigest.set(tokenDigest, session);
    return session;
  }

  getSessionByTokenDigest(tokenDigest) { return this.sessionsByDigest.get(tokenDigest) || null; }

  listSessionsForUser(userId) {
    return [...this.sessionsByDigest.values()].filter((x) => x.userId === userId);
  }

  activeSessionCount(at = new Date()) {
    return [...this.sessionsByDigest.values()].filter((x) => !x.revokedAt && !sessionIsExpired(x, at)).length;
  }

  touchSession(tokenDigest, at = now()) {
    const session = this.sessionsByDigest.get(tokenDigest);
    if (!session || session.revokedAt || sessionIsExpired(session, at)) return false;
    session.lastSeenAt = at;
    return true;
  }

  revokeSession(tokenDigest, at = now()) {
    const session = this.sessionsByDigest.get(tokenDigest);
    if (!session || session.revokedAt) return false;
    session.revokedAt = at;
    return true;
  }

  revokeAllSessions(userId, at = now()) {
    let count = 0;
    for (const session of this.sessionsByDigest.values()) {
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
