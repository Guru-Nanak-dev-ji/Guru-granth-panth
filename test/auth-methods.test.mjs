import test from 'node:test';
import assert from 'node:assert/strict';
import { getReadyAuthMethods, isAuthMethodReady } from '../server/auth-methods.mjs';

test('sandbox exposes password fallback only while OAuth and OTP routes are not ready', () => {
  const methods = getReadyAuthMethods({ environment: 'sandbox' });
  assert.deepEqual(methods.map((method) => method.id), ['password']);
  assert.equal(isAuthMethodReady('google', { environment: 'sandbox' }), false);
  assert.equal(isAuthMethodReady('x', { environment: 'sandbox' }), false);
  assert.equal(isAuthMethodReady('phone_otp', { environment: 'sandbox' }), false);
});

test('sandbox-only password fallback is not exposed outside sandbox', () => {
  assert.deepEqual(getReadyAuthMethods({ environment: 'test' }), []);
  assert.deepEqual(getReadyAuthMethods({ environment: 'production' }), []);
});

test('public method metadata contains no readiness flag or secret material', () => {
  const [method] = getReadyAuthMethods({ environment: 'sandbox' });
  assert.equal('ready' in method, false);
  assert.equal('secret' in method, false);
  assert.equal(method.id, 'password');
});
