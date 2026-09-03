import crypto from 'node:crypto';

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function issueSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function digestSessionToken(token) {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) return null;
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

export function sessionExpiry(createdAt = new Date(), ttlMs = SESSION_TTL_MS) {
  const base = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(base.getTime())) throw new Error('invalid_session_created_at');
  return new Date(base.getTime() + ttlMs).toISOString();
}

export function sessionIsExpired(session, at = new Date()) {
  if (!session?.expiresAt) return true;
  const when = at instanceof Date ? at : new Date(at);
  const expiry = new Date(session.expiresAt);
  if (Number.isNaN(when.getTime()) || Number.isNaN(expiry.getTime())) return true;
  return expiry.getTime() <= when.getTime();
}
