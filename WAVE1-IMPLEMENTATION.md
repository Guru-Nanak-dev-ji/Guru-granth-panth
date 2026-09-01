# KDN CHAT A — Wave 1 Identity & Security Foundation

Status: **SANDBOX implementation candidate**. This is not a live deployment claim.

## Included
- Opaque `usr_` and `ses_` identifiers.
- Registration with 12+ character password rule.
- Scrypt password hashing with per-user salt.
- Login with basic IP-rate limiting.
- Bearer sessions with session inventory and revoke/logout-all.
- Generic recovery request response that does not enumerate accounts.
- Sandbox-only hard guard: `KDN_ENV=live` causes startup refusal.
- Minimal browser UI for sandbox registration/login/session tests.
- Safe JSON 404 responses and security headers.
- Zero runtime dependencies beyond Node.js 20+.

## Deliberately not included yet
- Persistent database/PostgreSQL.
- Email/OTP delivery.
- MFA/passkeys.
- Production secrets/JWT keys.
- Live OAuth/SSO.
- Trusted recovery contacts.
- Admin console.
- Real deployment/provider configuration.

## CHAT A merge gate
Before merging this candidate toward a deployable environment:
1. Replace ephemeral maps with PostgreSQL migrations and repositories.
2. Add normalized identity uniqueness constraints without exposing lookup enumeration.
3. Add secure cookie/session or signed-token strategy with rotation and expiry.
4. Add CSRF protections if cookie auth is selected.
5. Add recovery-token hashing, expiry, cooldown, notifications, and authorized email provider.
6. Add MFA/passkey strategy and high-risk re-authentication.
7. Add audit events without passwords/tokens/OTP in logs.
8. Add integration tests for register/login/me/revoke/recovery and abuse/rate limits.
9. Verify mock/sandbox/live configuration separation.
10. Verify root/direct routes and safe non-enumerating 404 behavior.

## Constitutional locks
Relationship ≠ Account Ownership. Trusted Contact ≠ Password Access. AI ≠ Secret Holder. Device Possession ≠ Identity. Mock/Sandbox ≠ Live. Final live merge authority remains CHAT A only.
