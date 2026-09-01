import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMigrationTarget } from '../server/migration-guard.mjs';

test('accepts local sandbox PostgreSQL database', () => {
  const result = validateMigrationTarget({
    environment: 'sandbox',
    databaseUrl: 'postgresql://kdn:test@localhost:5432/kdn_sandbox'
  });
  assert.equal(result.database, 'kdn_sandbox');
  assert.equal(result.remote, false);
});

test('refuses live environment', () => {
  assert.throws(() => validateMigrationTarget({
    environment: 'live',
    databaseUrl: 'postgresql://kdn:test@localhost:5432/kdn_sandbox'
  }), /refuses live\/production environment/);
});

test('refuses missing database URL', () => {
  assert.throws(() => validateMigrationTarget({ environment: 'sandbox', databaseUrl: '' }), /DATABASE_URL is required/);
});

test('refuses non-PostgreSQL URL', () => {
  assert.throws(() => validateMigrationTarget({
    environment: 'sandbox',
    databaseUrl: 'mysql://localhost/kdn_sandbox'
  }), /only permits PostgreSQL/);
});

test('refuses production-looking database name', () => {
  assert.throws(() => validateMigrationTarget({
    environment: 'sandbox',
    databaseUrl: 'postgresql://localhost/kdn-production'
  }), /production-looking database name/);
});

test('remote sandbox needs explicit opt-in', () => {
  assert.throws(() => validateMigrationTarget({
    environment: 'sandbox',
    databaseUrl: 'postgresql://example.invalid/kdn_sandbox'
  }), /requires KDN_ALLOW_REMOTE_SANDBOX_DB=1/);

  const result = validateMigrationTarget({
    environment: 'sandbox',
    databaseUrl: 'postgresql://example.invalid/kdn_sandbox',
    allowRemoteSandbox: true
  });
  assert.equal(result.remote, true);
});
