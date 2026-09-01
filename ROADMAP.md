# KDN Living Implementation Roadmap

Canonical architecture is frozen at **P61–P150**. New ideas normally become versioned addenda, not P151+.

## Done
- P61–P150 CHAT B architecture frozen.
- Real GitHub repo connected.
- Wave 1 sandbox branch created: `chat-a/wave1-identity-security`.
- Opaque Khatri ID + session foundation implemented.
- Password hashing, login rate limiting, logout/revoke, non-enumerating recovery request behavior implemented.
- Sandbox-only live guard implemented.
- GitHub Actions CI added.
- Wave 1 CI: unit tests, health smoke tests, safe 404 and live-guard checks passing.

## In Progress
### Wave 1 — Identity & Security
- Replace ephemeral storage with PostgreSQL-backed repositories.
- Add durable security audit events.
- Add production-grade session/token strategy.
- Add MFA/passkey-ready interfaces.
- Add account-recovery delivery abstraction without exposing secrets.
- Add explicit mock/sandbox/live database separation.

## Next
### Wave 2 — Web / PWA
- Real root `index.html` application shell.
- SPA routing + safe `404.html` fallback.
- `manifest.webmanifest`, service worker and offline shell.
- CSP/security headers and base-path-safe assets.
- Mobile-first My Kingdom home.

### Wave 3 — Core Product
- Family/Gharana consent graph and family tree.
- Panchayat/Takht read models and governance UI.
- Social graph, posts/feed, messaging and search foundations.

### Wave 4 — AI
- Provider-neutral AI gateway.
- Tark Singh / Bhavna Kaur synthetic persona disclosure.
- Free-first/local fallback.
- Human approval for consequential AI actions.

### Wave 5 — Service Modules
- Khatri Aid / volunteer seva.
- Guru Nanak Kitchen.
- Jobs / marketplace / education / events.
- Donations, points, reputation and Nanak Coin ledger separation.

### Wave 6 — Connectors / Reliability
- OAuth/webhook connectors only with real authorized accounts.
- Observability, backups, SRE, performance and release engineering.

### Wave 7 — Launch Gate
- End-to-end tests.
- Privacy/security/AI/finance/governance red team.
- Migration and rollback drills.
- Authenticated deployment evidence + smoke tests.
- Final live merge: **CHAT A only**.

## Blocked / Human Action Rules
Work continues around blockers. Ask the human only when needed for money/payment, paid model/subscription, external account/connector setup, credential entry, legal/account-owner decision, consequential public action outside standing authorization, or another genuinely non-resolvable choice.

Never ask for passwords, PINs, OTPs, CVVs or secret keys in chat.

## Constitutional Locks
- Architecture complete ≠ product complete.
- Build success ≠ deployment success.
- Mock/sandbox ≠ live.
- Relationship ≠ account ownership.
- Community governance ≠ state authority.
- Donation/points/reputation ≠ vote weight or human worth.
- AI capability ≠ authorization.
- AI persona ≠ human identity.
- CHAT A only = final live merge authority.
