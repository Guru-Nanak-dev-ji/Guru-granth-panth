# KDN Online Readiness — CHAT A

Status: **implementation checklist, not a deployment claim**.

Goal: move KDN workstreams toward a usable online state while preserving the frozen onboarding/consent rules and mock/sandbox/live separation.

## Done / prepared
- Frozen onboarding v1 master copy is in repo.
- Auth methods fail closed: unconfigured Google/X/Phone OTP controls do not render.
- OAuth readiness requires complete provider configuration, start path, callback/verification path, and PKCE/state protections where applicable.
- Permission popup resists accidental backdrop dismissal while keeping explicit decline/back paths.
- Bank connection remains read-only intent only; no bank secrets and no money movement.
- PWA manifest added for the web shell.
- Static `404.html` fallback added so project-page/deep-link navigation can return safely to the app root instead of stranding the user on a dead page.

## Next safe implementation work
1. Link `manifest.webmanifest` from the web shell and add a no-secret PWA smoke test.
2. Add route restoration logic for the saved `kdn_requested_route` without granting permissions or starting OAuth implicitly.
3. Add service-worker/offline shell only after cache boundaries are defined; never cache auth tokens, banking data, private messages, or sensitive API responses.
4. Complete one real official sign-in provider end-to-end before exposing its button.
5. Convert identity routes to async repository contract and connect PostgreSQL only to an isolated sandbox/test DB first.
6. Add recovery delivery abstraction and MFA/passkey-ready interfaces.
7. Build Social Hub provider interfaces with explicit scopes/revocation/provenance; no scraping and no fake connected states.
8. Build disclosed AI assistant/auto-reply interfaces with human escalation and AI-memory default OFF.
9. Prepare read-only Open-Banking adapter behind a reviewed provider; no credential collection in KDN.
10. Run E2E, privacy, consent, 404/deep-link, rollback and authenticated smoke tests before any live merge.

## Human/connector gates
Ask the user only when one of these is actually required:
- Google/X/other OAuth developer app/account authorization.
- Phone/SMS provider account or paid usage.
- Isolated PostgreSQL sandbox/test database provisioning if a free/local option is not available.
- Hosting/backend account or paid deployment decision.
- Open-Banking provider onboarding/account authorization.
- Social account OAuth authorization.
- App-store/developer-account setup for native distribution.
- Legal/tax/securities review before any real revenue-sharing/share activation.
- Any consequential public action outside existing standing authorization.

Never ask for passwords, PINs, OTPs, CVVs, seed phrases or secret keys in chat.

## Deployment evidence rule
A build, branch, PR, GitHub Pages setting, or workflow success is **not** enough to claim KDN is live. A deployment claim requires an authenticated destination, a concrete URL, correct environment, and successful smoke checks of root + key routes + 404/deep-link behavior.

Final live merge remains **CHAT A only**.
