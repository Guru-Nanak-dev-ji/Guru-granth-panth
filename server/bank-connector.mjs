export function createBankConnector({ environment = 'sandbox', provider = null } = {}) {
  if (environment === 'live') throw new Error('bank_connector_live_not_enabled');

  function status() {
    return {
      environment,
      configured: Boolean(provider),
      provider: provider || null,
      mode: 'read_only_first',
      moneyMovementAuthorized: false,
      credentialCollection: 'prohibited'
    };
  }

  function createReadOnlyLinkIntent({ userId, permissionGranted }) {
    if (!userId) return { ok: false, error: 'authenticated_user_required' };
    if (!permissionGranted) return { ok: false, error: 'bank_read_permission_required' };
    if (!provider) {
      return {
        ok: false,
        error: 'bank_provider_not_configured',
        linked: false,
        moneyMovementAuthorized: false,
        next: 'Configure a reviewed official Open-Banking/OAuth provider. KDN must not collect bank passwords, PINs, OTPs or CVVs.'
      };
    }

    return {
      ok: true,
      linked: false,
      provider,
      mode: 'read_only_first',
      moneyMovementAuthorized: false,
      handoffRequired: true,
      note: 'The provider-hosted OAuth/Open-Banking flow must complete before KDN records any linked account.'
    };
  }

  return { status, createReadOnlyLinkIntent };
}
