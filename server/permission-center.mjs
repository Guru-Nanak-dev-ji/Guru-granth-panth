const CATALOG = Object.freeze([
  {
    key: 'kdn.membership',
    title: 'KDN Membership',
    description: 'Join KDN and unlock progressive services. You can revoke optional permissions later.',
    risk: 'standard',
    reversible: true
  },
  {
    key: 'ai.avatar',
    title: 'AI Avatar / Auto Reply',
    description: 'Allow a clearly disclosed KDN AI avatar to answer routine messages and escalate consequential conversations to you.',
    risk: 'standard',
    reversible: true
  },
  {
    key: 'social.connect',
    title: 'Social Hub Connections',
    description: 'Allow official OAuth/API account connections. KDN never asks for social passwords in chat.',
    risk: 'elevated',
    reversible: true
  },
  {
    key: 'bank.read',
    title: 'Bank Account Connection — Read Only',
    description: 'Allow an official Open Banking/OAuth provider to connect account identity, balances and transaction data. This does not authorize money movement.',
    risk: 'high',
    reversible: true
  }
]);

const byKey = new Map(CATALOG.map((item) => [item.key, item]));

export function createPermissionCenter({ environment = 'sandbox' } = {}) {
  if (environment === 'live') throw new Error('permission_center_live_not_enabled');
  const grantsByUser = new Map();
  const events = [];

  function userMap(userId) {
    if (!grantsByUser.has(userId)) grantsByUser.set(userId, new Map());
    return grantsByUser.get(userId);
  }

  function catalog() {
    return CATALOG.map((item) => ({ ...item }));
  }

  function list(userId) {
    const grants = userMap(userId);
    return catalog().map((item) => ({
      ...item,
      state: grants.get(item.key)?.state || 'not_granted',
      grantedAt: grants.get(item.key)?.grantedAt || null,
      revokedAt: grants.get(item.key)?.revokedAt || null
    }));
  }

  function grant(userId, key, { acknowledged = false } = {}) {
    const permission = byKey.get(key);
    if (!permission) return { ok: false, error: 'unknown_permission' };
    if (!acknowledged) return { ok: false, error: 'explicit_acknowledgement_required' };
    const at = new Date().toISOString();
    const record = { state: 'granted', grantedAt: at, revokedAt: null };
    userMap(userId).set(key, record);
    events.push({ type: 'permission.granted', userId, key, at, environment });
    return { ok: true, permission: { ...permission, ...record } };
  }

  function revoke(userId, key) {
    const permission = byKey.get(key);
    if (!permission) return { ok: false, error: 'unknown_permission' };
    const at = new Date().toISOString();
    const previous = userMap(userId).get(key);
    const record = {
      state: 'revoked',
      grantedAt: previous?.grantedAt || null,
      revokedAt: at
    };
    userMap(userId).set(key, record);
    events.push({ type: 'permission.revoked', userId, key, at, environment });
    return { ok: true, permission: { ...permission, ...record } };
  }

  function has(userId, key) {
    return userMap(userId).get(key)?.state === 'granted';
  }

  function auditCount() {
    return events.length;
  }

  return { kind: 'sandbox-memory-permission-center', catalog, list, grant, revoke, has, auditCount };
}

export const permissionCatalog = () => CATALOG.map((item) => ({ ...item }));
