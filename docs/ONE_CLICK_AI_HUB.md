# KDN One-Click AI Hub

## Goal
Give every KDN member a personal AI that can accept text, voice, or one-click commands and can assist with replies across connected services.

## User-facing rules
1. The user owns the AI profile and can turn capabilities on/off.
2. Auto-replies are OFF by default.
3. Any automated message must visibly identify itself as AI-assisted or AI-generated.
4. External accounts require explicit account authorization before reading or sending.
5. High-impact actions should support Preview / Apply / Cancel.
6. Users can revoke access at any time.

## Provider layer
Use a provider adapter so one KDN interface can route to OpenAI or xAI without exposing provider keys in the browser.

- OpenAI: server-side Responses API.
- xAI/Grok: server-side Responses API / compatible provider adapter.
- KDN AI: personal profile, memory permissions, policy and routing layer above providers.

## Required backend modules
- `ai-gateway`: provider selection, model routing, usage limits and failures.
- `identity`: KDN member + personal AI identity.
- `connections`: OAuth/account permissions for supported services.
- `reply-engine`: draft-first, approval mode, trusted auto-reply rules.
- `audit`: who/what generated and sent each message.
- `policy`: disclosure, minors/safety, rate limits and anti-spam controls.

## Auto-reply modes
- OFF: no automated response.
- DRAFT: AI prepares a reply, human sends it.
- TRUSTED: AI may auto-send only for user-approved contacts/channels and rules.
- AWAY: AI responds during configured hours with a clear AI disclosure.

## Security
Never place `OPENAI_API_KEY`, `XAI_API_KEY`, social platform access tokens, or refresh tokens in static HTML/JavaScript or a public repository. Store secrets only in server-side secret storage.

## Current milestone
The repository branch `kdn-one-click-ai-hub` contains the mobile-first control-panel shell. Live provider calls and account connectors are the next backend milestone.
