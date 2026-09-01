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

  store.createSession('token1', { id: 'ses_1', userId: 'usr_123', createdAt: 't1', lastSeenAt: 't1', revokedAt: null });
  store.createSession('token2', { id: 'ses_2', userId: 'usr_other', createdAt: 't1', lastSeenAt: 't1', revokedAt: null });
  assert.deepEqual(store.listSessionsForUser('usr_123').map(x => x.id), ['ses_1']);
  assert.equal(store.revokeAllSessions('usr_123', 't2'), 1);
  assert.equal(store.getSessionByToken('token1').revokedAt, 't2');
  assert.equal(store.getSessionByToken('token2').revokedAt, null);
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
