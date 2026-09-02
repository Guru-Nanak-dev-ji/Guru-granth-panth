const METHODS = Object.freeze({
  google: Object.freeze({ id: 'google', label: 'Google से जारी रखें', kind: 'oauth-pkce', ready: false }),
  x: Object.freeze({ id: 'x', label: 'X से जारी रखें', kind: 'oauth-pkce', ready: false }),
  phone_otp: Object.freeze({ id: 'phone_otp', label: 'फ़ोन OTP से जारी रखें', kind: 'otp', ready: false }),
  password: Object.freeze({ id: 'password', label: 'Password से जारी रखें', kind: 'password', ready: true, sandboxOnly: true })
});

export function getReadyAuthMethods({ environment = 'sandbox' } = {}) {
  return Object.values(METHODS)
    .filter((method) => method.ready)
    .filter((method) => !method.sandboxOnly || environment === 'sandbox')
    .map(({ ready, ...publicMethod }) => publicMethod);
}

export function isAuthMethodReady(methodId, { environment = 'sandbox' } = {}) {
  return getReadyAuthMethods({ environment }).some((method) => method.id === methodId);
}
