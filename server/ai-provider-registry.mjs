const PROVIDERS = Object.freeze({
  openai: Object.freeze({
    id: 'openai',
    label: 'OpenAI',
    apiFamily: 'responses',
    configured: false,
    serverSecretEnv: 'OPENAI_API_KEY',
    capabilities: ['text', 'tools', 'structured_output'],
    userFacing: true
  }),
  xai: Object.freeze({
    id: 'xai',
    label: 'xAI / Grok',
    apiFamily: 'responses-compatible',
    configured: false,
    serverSecretEnv: 'XAI_API_KEY',
    capabilities: ['text', 'tools', 'structured_output'],
    userFacing: true
  })
});

export function listAIProviders() {
  return Object.values(PROVIDERS).map(({ serverSecretEnv, ...safe }) => ({
    ...safe,
    ready: safe.configured === true
  }));
}

export function listReadyAIProviders() {
  return listAIProviders().filter((provider) => provider.ready);
}

export function isAIProviderReady(providerId) {
  return listReadyAIProviders().some((provider) => provider.id === providerId);
}

export function getAIProviderConfig(providerId) {
  const provider = PROVIDERS[providerId];
  if (!provider) return null;
  return {
    id: provider.id,
    apiFamily: provider.apiFamily,
    configured: provider.configured === true,
    serverSecretEnv: provider.serverSecretEnv
  };
}
