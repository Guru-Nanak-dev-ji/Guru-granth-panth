import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresIdentityStore } from '../server/postgres-identity-store.mjs';

class FakeDb {
  constructor(results = []) {
    this.results = [...results];
    this.calls = [];
  }
  async query(text, params = []) {
    this.calls.push({ text, params });
    return this.results.shift() ?? { rowCount: 0, rows: [] };
  }
}

test('refuses live and missing clients', () => {
  assert.throws(() => new PostgresIdentityStore({ environment: 'live', db: { query() {} } }), /live mode is not enabled/);
  assert.throws(() => new PostgresIdentityStore({ environment: 'sandbox' }), /postgres_query_client_required/);
});

test('createSession only sends token digest to PostgreSQL', async () => {
  const db = new FakeDb([{ rowCount: 1, rows: [{
    id: 'ses_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    user_id: 'usr_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    created_at: '2026-09-01T00:00:00.000Z',
    last_seen_at: '2026-09-01T00:00:00.000Z',
    expires_at: '2026-09-08T00:00:00.000Z',
    revoked_at: null
  }] }]);
  const store = new PostgresIdentityStore({ db });
  const digest = 'd'.repeat(64);
  const session = {
    id: 'ses_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    userId: 'usr_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    createdAt: '2026-09-01T00:00:00.000Z',
    lastSeenAt: '2026-09-01T00:00:00.000Z',
    expiresAt: '2026-09-08T00:00:00.000Z',
    revokedAt: null
  };

  const created = await store.createSession(digest, session);
  assert.equal(db.calls.length, 1);
  assert.equal(db.calls[0].params[2], digest);
  assert.equal(db.calls[0].params.includes('raw-secret-token'), false);
  assert.equal(created.userId, session.userId);
});

test('touchSession fails closed through SQL predicates for revoked/expired sessions', async () => {
  const db = new FakeDb([{ rowCount: 0, rows: [] }]);
  const store = new PostgresIdentityStore({ db });
  const ok = await store.touchSession('d'.repeat(64), '2026-09-02T00:00:00.000Z');
  assert.equal(ok, false);
  assert.match(db.calls[0].text, /revoked_at IS NULL/);
  assert.match(db.calls[0].text, /expires_at > \$2/);
});

test('audit metadata is serialized as jsonb and raw bearer data is not part of the API', async () => {
  const db = new FakeDb([{ rowCount: 1, rows: [] }]);
  const store = new PostgresIdentityStore({ db });
  const event = await store.recordAudit('login', { userId: 'usr_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', metadata: { source: 'sandbox' } });
  assert.equal(event.type, 'login');
  assert.equal(db.calls[0].params[5], JSON.stringify({ source: 'sandbox' }));
  assert.match(db.calls[0].text, /\$6::jsonb/);
});
