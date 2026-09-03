import test from 'node:test';
import assert from 'node:assert/strict';
import {
  listAIProviders,
  listReadyAIProviders,
  isAIProviderReady,
  getAIProviderConfig
} from '../server/ai-provider-registry.mjs';

test('OpenAI and xAI exist but remain disabled until server configuration is complete', () => {
  const providers = listAIProviders();
  assert.deepEqual(providers.map((p) => p.id), ['openai', 'xai']);
  assert.equal(providers.every((p) => p.ready === false), true);
  assert.deepEqual(listReadyAIProviders(), []);
  assert.equal(isAIProviderReady('openai'), false);
  assert.equal(isAIProviderReady('xai'), false);
});

test('public provider metadata never exposes secret environment names', () => {
  for (const provider of listAIProviders()) {
    assert.equal('serverSecretEnv' in provider, false);
  }
});

test('server-only provider config identifies secret env without containing secret values', () => {
  assert.deepEqual(getAIProviderConfig('openai'), {
    id: 'openai',
    apiFamily: 'responses',
    configured: false,
    serverSecretEnv: 'OPENAI_API_KEY'
  });
  assert.equal(getAIProviderConfig('missing'), null);
});
