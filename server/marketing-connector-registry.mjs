const CONNECTORS = Object.freeze({
  google: Object.freeze({ id: 'google', label: 'Google', auth: 'oauth', configured: false, mode: 'official-api-only' }),
  x: Object.freeze({ id: 'x', label: 'X', auth: 'oauth', configured: false, mode: 'official-api-only' }),
  meta: Object.freeze({ id: 'meta', label: 'Meta', auth: 'oauth', configured: false, mode: 'official-api-only' }),
  whatsapp: Object.freeze({ id: 'whatsapp', label: 'WhatsApp', auth: 'provider', configured: false, mode: 'official-api-only' }),
  youtube: Object.freeze({ id: 'youtube', label: 'YouTube', auth: 'oauth', configured: false, mode: 'official-api-only' }),
  tiktok: Object.freeze({ id: 'tiktok', label: 'TikTok', auth: 'oauth', configured: false, mode: 'official-api-only' }),
  linkedin: Object.freeze({ id: 'linkedin', label: 'LinkedIn', auth: 'oauth', configured: false, mode: 'official-api-only' })
});

export function listMarketingConnectors() {
  return Object.values(CONNECTORS).map((connector) => ({
    ...connector,
    ready: connector.configured === true
  }));
}

export function listReadyMarketingConnectors() {
  return listMarketingConnectors().filter((connector) => connector.ready);
}

export function isMarketingConnectorReady(connectorId) {
  return listReadyMarketingConnectors().some((connector) => connector.id === connectorId);
}

export function marketingSafetyPolicy() {
  return Object.freeze({
    officialApiOnly: true,
    credentialScraping: false,
    silentCrossPost: false,
    paidAdsRequireHumanApproval: true,
    investmentShareMarketingRequiresLegalReview: true,
    routineOrganicPublishingRequiresAuthenticatedDestination: true
  });
}
