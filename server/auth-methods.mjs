const METHODS = Object.freeze({
  google: Object.freeze({
    id: 'google',
    label: 'Google से जारी रखें',
    kind: 'oauth-pkce',
    providerConfigured: false,
    startPath: null,
    callbackPath: null,
    pkce: false,
    stateNonce: false
  }),
  x: Object.freeze({
    id: 'x',
    label: 'X से जारी रखें',
    kind: 'oauth-pkce',
    providerConfigured: false,
    startPath: null,
    callbackPath: null,
    pkce: false,
    stateNonce: false
  }),
  phone_otp: Object.freeze({
    id: 'phone_otp',
    label: 'फ़ोन OTP से जारी रखें',
    kind: 'otp',
    providerConfigured: false,
    startPath: null,
    verifyPath: null
  }),
  password: Object.freeze({
    id: 'password',
    label: 'KDN Password',
    kind: 'password',
    sandboxOnly: true
  })
});

function methodIsComplete(method, environment) {
  if (method.kind === 'password') {
    return method.sandboxOnly ? environment === 'sandbox' : true;
  }

  if (!method.providerConfigured) return false;

  if (method.kind === 'oauth-pkce') {
    return Boolean(
      method.startPath &&
      method.callbackPath &&
      method.pkce === true &&
      method.stateNonce === true
    );
  }

  if (method.kind === 'otp') {
    return Boolean(method.startPath && method.verifyPath);
  }

  return false;
}

function publicMethod(method) {
  const result = {
    id: method.id,
    label: method.label,
    kind: method.kind
  };
  if (method.startPath) result.startPath = method.startPath;
  return result;
}

export function getReadyAuthMethods({ environment = 'sandbox' } = {}) {
  return Object.values(METHODS)
    .filter((method) => methodIsComplete(method, environment))
    .map(publicMethod);
}

export function isAuthMethodReady(methodId, { environment = 'sandbox' } = {}) {
  const method = METHODS[methodId];
  return Boolean(method && methodIsComplete(method, environment));
}
