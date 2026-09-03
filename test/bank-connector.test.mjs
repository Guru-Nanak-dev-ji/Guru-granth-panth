import test from 'node:test';
import assert from 'node:assert/strict';
import { createBankConnector } from '../server/bank-connector.mjs';

test('bank connector is read-only first and never authorizes money movement', () => {
  const connector = createBankConnector({ environment: 'sandbox' });
  const status = connector.status();
  assert.equal(status.mode, 'read_only_first');
  assert.equal(status.moneyMovementAuthorized, false);
  assert.equal(status.credentialCollection, 'prohibited');
});

test('bank connector refuses link intent without explicit bank.read permission', () => {
  const connector = createBankConnector({ environment: 'sandbox', provider: 'example-oauth-provider' });
  const result = connector.createReadOnlyLinkIntent({ userId: 'usr_demo', permissionGranted: false });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'bank_read_permission_required');
});

test('unconfigured provider fails closed without collecting credentials', () => {
  const connector = createBankConnector({ environment: 'sandbox' });
  const result = connector.createReadOnlyLinkIntent({ userId: 'usr_demo', permissionGranted: true });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'bank_provider_not_configured');
  assert.equal(result.linked, false);
  assert.equal(result.moneyMovementAuthorized, false);
  assert.match(result.next, /must not collect bank passwords, PINs, OTPs or CVVs/i);
});

test('configured provider still requires external handoff before linked state', () => {
  const connector = createBankConnector({ environment: 'sandbox', provider: 'example-oauth-provider' });
  const result = connector.createReadOnlyLinkIntent({ userId: 'usr_demo', permissionGranted: true });
  assert.equal(result.ok, true);
  assert.equal(result.linked, false);
  assert.equal(result.handoffRequired, true);
  assert.equal(result.moneyMovementAuthorized, false);
});

test('live mode is refused until reviewed live integration exists', () => {
  assert.throws(() => createBankConnector({ environment: 'live' }), /live_not_enabled/);
});
