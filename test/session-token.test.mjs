import test from 'node:test';
import assert from 'node:assert/strict';
import { digestSessionToken, issueSessionToken, sessionExpiry, sessionIsExpired } from '../server/session-token.mjs';

test('issued session token is opaque and only its digest is storage-safe', () => {
  const token = issueSessionToken();
  assert.match(token, /^[a-f0-9]{64}$/);
  const digest = digestSessionToken(token);
  assert.match(digest, /^[a-f0-9]{64}$/);
  assert.notEqual(digest, token);
  assert.equal(digestSessionToken('not-a-token'), null);
});

test('session expiry is explicit and fail-closed', () => {
  const expiresAt = sessionExpiry('2026-09-01T00:00:00.000Z', 1000);
  assert.equal(expiresAt, '2026-09-01T00:00:01.000Z');
  assert.equal(sessionIsExpired({ expiresAt }, '2026-09-01T00:00:00.999Z'), false);
  assert.equal(sessionIsExpired({ expiresAt }, '2026-09-01T00:00:01.000Z'), true);
  assert.equal(sessionIsExpired({}, '2026-09-01T00:00:00.000Z'), true);
});
