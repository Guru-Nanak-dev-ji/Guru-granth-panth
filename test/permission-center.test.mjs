import test from 'node:test';
import assert from 'node:assert/strict';
import { createPermissionCenter } from '../server/permission-center.mjs';

test('permission center requires explicit acknowledgement', () => {
  const center = createPermissionCenter({ environment: 'sandbox' });
  const result = center.grant('usr_demo', 'social.connect');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'explicit_acknowledgement_required');
  assert.equal(center.has('usr_demo', 'social.connect'), false);
});

test('permission can be granted and revoked independently', () => {
  const center = createPermissionCenter({ environment: 'sandbox' });
  assert.equal(center.grant('usr_demo', 'ai.avatar', { acknowledged: true }).ok, true);
  assert.equal(center.has('usr_demo', 'ai.avatar'), true);
  assert.equal(center.has('usr_demo', 'social.connect'), false);
  assert.equal(center.revoke('usr_demo', 'ai.avatar').ok, true);
  assert.equal(center.has('usr_demo', 'ai.avatar'), false);
});

test('bank permission is explicitly read-only and does not include money movement', () => {
  const center = createPermissionCenter({ environment: 'sandbox' });
  const bank = center.catalog().find((item) => item.key === 'bank.read');
  assert.ok(bank);
  assert.match(bank.title, /Read Only/i);
  assert.match(bank.description, /does not authorize money movement/i);
  assert.equal(center.catalog().some((item) => item.key === 'bank.transfer'), false);
});

test('permission center refuses live mode until a reviewed live adapter exists', () => {
  assert.throws(() => createPermissionCenter({ environment: 'live' }), /live_not_enabled/);
});
