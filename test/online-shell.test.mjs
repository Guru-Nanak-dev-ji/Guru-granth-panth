import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const manifestPath = new URL('../web/manifest.webmanifest', import.meta.url);
const fallbackPath = new URL('../web/404.html', import.meta.url);

test('PWA manifest is valid and does not request privileged capabilities', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.equal(manifest.short_name, 'KDN');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  assert.equal('permissions' in manifest, false);
});

test('404 fallback stores requested route and returns to app root without starting auth or payment', async () => {
  const html = await readFile(fallbackPath, 'utf8');
  assert.match(html, /kdn_requested_route/);
  assert.match(html, /location\.replace\(base\)/);
  assert.doesNotMatch(html, /oauth|payment|transfer|bank\.read|authorization/i);
});

test('online shell files contain no known demo passwords or secret placeholders', async () => {
  const combined = `${await readFile(manifestPath, 'utf8')}\n${await readFile(fallbackPath, 'utf8')}`;
  assert.doesNotMatch(combined, /admin123|user123|client_secret|api[_-]?key|private[_-]?key/i);
});
