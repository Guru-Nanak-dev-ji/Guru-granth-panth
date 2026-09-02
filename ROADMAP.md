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
- Wave 1 CI: unit tests, health smoke tests, safe 404 and live-guard checks passing on the previously verified build.
- Identity repository abstraction and in-memory sandbox adapter implemented.
- Durable security audit event contract implemented for the sandbox adapter.
- PostgreSQL migration `server/migrations/001_identity_security.sql` added for users, sessions, security audit and recovery requests; it is not applied to any live database.
- Fail-closed migration preflight added: refuses live/production environments, non-PostgreSQL URLs, production-looking database names and remote databases without explicit sandbox opt-in.
- Migration guard unit tests added and `npm run db:preflight` exposed.
- Session bearer hardening added: raw bearer tokens are returned only to the client, while the server repository receives SHA-256 token digests only.
- Explicit seven-day sandbox session expiry added; expired sessions fail closed and are excluded from active-session health counts.
- Token digest / expiry unit tests added; PostgreSQL schema and sandbox repository contract now agree on `token_digest` semantics.

## In Progress
### Wave 1 — Identity & Security
- Implement PostgreSQL-backed repository adapter behind the existing identity-store contract.
- Add MFA/passkey-ready interfaces.
- Add account-recovery delivery abstraction without exposing secrets.
- Verify the latest token-digest/expiry hardening CI run before treating it as green.
- Add PostgreSQL integration tests once an isolated test database is available.

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

Current non-blocking infrastructure gap: no isolated PostgreSQL sandbox/test database has been provisioned or verified yet. Schema, adapter and fail-closed migration tooling can continue without claiming any migration has been applied.

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
