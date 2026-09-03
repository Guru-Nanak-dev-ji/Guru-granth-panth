import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getReadyAuthMethods,
  isAuthMethodReady,
  isCompleteAuthMethodDefinition
} from '../server/auth-methods.mjs';

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

test('OAuth method is incomplete until provider, start, callback, PKCE and state/nonce are all present', () => {
  const base = {
    id: 'google',
    label: 'Google',
    kind: 'oauth-pkce',
    providerConfigured: true,
    startPath: '/api/v1/auth/google/start',
    callbackPath: '/api/v1/auth/google/callback',
    pkce: true,
    stateNonce: true
  };

  assert.equal(isCompleteAuthMethodDefinition(base), true);
  assert.equal(isCompleteAuthMethodDefinition({ ...base, providerConfigured: false }), false);
  assert.equal(isCompleteAuthMethodDefinition({ ...base, startPath: null }), false);
  assert.equal(isCompleteAuthMethodDefinition({ ...base, callbackPath: null }), false);
  assert.equal(isCompleteAuthMethodDefinition({ ...base, pkce: false }), false);
  assert.equal(isCompleteAuthMethodDefinition({ ...base, stateNonce: false }), false);
});

test('OTP method requires provider configuration plus start and verify paths', () => {
  const base = {
    id: 'phone_otp',
    label: 'Phone OTP',
    kind: 'otp',
    providerConfigured: true,
    startPath: '/api/v1/auth/phone/start',
    verifyPath: '/api/v1/auth/phone/verify'
  };

  assert.equal(isCompleteAuthMethodDefinition(base), true);
  assert.equal(isCompleteAuthMethodDefinition({ ...base, providerConfigured: false }), false);
  assert.equal(isCompleteAuthMethodDefinition({ ...base, startPath: null }), false);
  assert.equal(isCompleteAuthMethodDefinition({ ...base, verifyPath: null }), false);
});
