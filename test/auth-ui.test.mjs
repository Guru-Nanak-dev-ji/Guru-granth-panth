import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../web/index.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../web/app.js', import.meta.url), 'utf8');

test('Screen 1 contains no hard-coded Google, X or phone OTP auth buttons', () => {
  assert.equal(/<button[^>]*>\s*Google से जारी/i.test(html), false);
  assert.equal(/<button[^>]*>\s*X से जारी/i.test(html), false);
  assert.equal(/<button[^>]*>\s*फ़ोन OTP से जारी/i.test(html), false);
});

test('auth methods are rendered only from server readiness response', () => {
  assert.match(app, /api\/v1\/auth\/methods/);
  assert.match(app, /configuredAuthMethods\.replaceChildren\(\)/);
});

test('OAuth or OTP button requires an allowed provider and a server-provided root-relative startPath', () => {
  assert.match(app, /\['google','x','phone_otp'\]\.includes\(method\.id\)/);
  assert.match(app, /typeof method\.startPath !== 'string'/);
  assert.match(app, /!method\.startPath\.startsWith\('\/'\)/);
  assert.match(app, /window\.location\.assign\(method\.startPath\)/);
  assert.equal(/window\.location\.assign\(`\/api\/v1\/auth\/start\//.test(app), false);
});

test('password fallback starts hidden in the HTML', () => {
  assert.match(html, /<fieldset id="passwordRegister" hidden>/);
  assert.match(html, /<fieldset id="passwordLogin" hidden>/);
});
