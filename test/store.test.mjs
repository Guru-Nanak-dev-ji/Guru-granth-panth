import test from 'node:test';
import assert from 'node:assert/strict';
import { createIdentityStore } from '../server/store.mjs';

test('memory identity store refuses live environment', () => {
  assert.throws(() => createIdentityStore({ environment: 'live' }), /refuses live environment/);
});

test('user and session repository operations preserve opaque ownership boundaries', () => {
  const store = createIdentityStore({ environment: 'sandbox' });
  assert.equal(store.createUser({ id: 'usr_123', email: 'a@example.com', pw: {salt:'s',hash:'h'} }), true);
  assert.equal(store.createUser({ id: 'usr_456', email: 'a@example.com', pw: {salt:'s',hash:'h'} }), false);
  assert.equal(store.getUserByEmail('a@example.com').id, 'usr_123');

  store.createSession('digest1', { id: 'ses_1', userId: 'usr_123', createdAt: 't1', lastSeenAt: 't1', expiresAt: '2099-01-01T00:00:00.000Z', revokedAt: null });
  store.createSession('digest2', { id: 'ses_2', userId: 'usr_other', createdAt: 't1', lastSeenAt: 't1', expiresAt: '2099-01-01T00:00:00.000Z', revokedAt: null });
  assert.deepEqual(store.listSessionsForUser('usr_123').map(x => x.id), ['ses_1']);
  assert.equal(store.revokeAllSessions('usr_123', '2026-09-01T00:00:00.000Z'), 1);
  assert.equal(store.getSessionByTokenDigest('digest1').revokedAt, '2026-09-01T00:00:00.000Z');
  assert.equal(store.getSessionByTokenDigest('digest2').revokedAt, null);
});

test('expired sessions are excluded from active counts and cannot be touched', () => {
  const store = createIdentityStore({ environment: 'sandbox' });
  store.createSession('expired', { id: 'ses_old', userId: 'usr_123', createdAt: 't1', lastSeenAt: 't1', expiresAt: '2026-08-31T00:00:00.000Z', revokedAt: null });
  store.createSession('active', { id: 'ses_new', userId: 'usr_123', createdAt: 't1', lastSeenAt: 't1', expiresAt: '2026-09-03T00:00:00.000Z', revokedAt: null });
  assert.equal(store.activeSessionCount('2026-09-01T00:00:00.000Z'), 1);
  assert.equal(store.touchSession('expired', '2026-09-01T00:00:00.000Z'), false);
  assert.equal(store.touchSession('active', '2026-09-01T00:00:00.000Z'), true);
});

test('security audit is append-only through public interface', () => {
  const store = createIdentityStore({ environment: 'sandbox' });
  const first = store.recordAudit('auth.login', { userId: 'usr_123', outcome: 'success' });
  const second = store.recordAudit('auth.logout', { userId: 'usr_123', sessionId: 'ses_1', outcome: 'success' });
  const events = store.listAuditForTesting();
  assert.equal(events.length, 2);
  assert.match(first.id, /^aud_[a-f0-9]{32}$/);
  assert.equal(second.type, 'auth.logout');
  events[0].metadata.changed = true;
  assert.equal(store.listAuditForTesting()[0].metadata.changed, undefined);
});
