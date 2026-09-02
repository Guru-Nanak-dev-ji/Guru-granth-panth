# KDN Onboarding Copy v1 — FROZEN

Status: **FROZEN**

The marketing line “One Click Change Your Life — KDN” never overrides these consent rules.

## Screen order
0. Door: Thali / Work / Donation-Pickup. No login required.
1. Why KDN ID: show only sign-in methods that are genuinely configured and ready.
2. Who we are: not a government, not a bank, AI is a bot, one permission at a time, money requires a separate second Yes.
3. One permission for the selected job.
4. Proof: request recorded; buttons only Request / Home.
5. Optional next step: default primary action is **अभी नहीं**. Social and read-only bank remain secondary and separate.

## Five frozen copy corrections

### 1. Screen 1 English line
English: Choose one configured sign-in method. KDN never asks for your Google, X, or bank password, PIN, OTP, or CVV.

### 2. Identity card is not an onboarding popup
After sign-in, do not ask “पहचान की अनुमति दो” again.

Permission-home copy:
- स्थिति: चालू — क्योंकि तुमने साइन-इन किया।
- रद्द = उस लॉगिन को हटाओ या खाता मिटाने की माँग।

### 3. Plain-language retention copy
Use this sentence instead of “retention period” on identity/thali/pickup copy:

“काम पूरा होने के बाद पता सार्वजनिक नहीं रहेगा। सिर्फ़ ज़रूरी रिकॉर्ड रखा जा सकता है।”

Pickup also adds:

“यह पता प्रोफ़ाइल या बाज़ार पर नहीं चढ़ेगा।”

### 4. Work card audience
Do not say marketplace/community.

Use:

“जो लोग KDN के काम खंड में जाएँ, वे कार्ड देख सकते हैं।”

No income or job guarantee language.

### 5. WhatsApp notification is not human support
Under `notify.whatsapp`:

“यह अपडेट के लिए है। इंसान से बात: वही नंबर, जब तुम लिखो। KDN खुद बार-बार प्रचार नहीं भेजेगा।”

## Freeze list for development
- Screen 0–5 in this exact order.
- Screen 5 default/primary: **अभी नहीं**.
- “फिर मत पूछो” = only the same permission + the same task popup.
- Push / Email / WhatsApp are three separate scopes.
- Bank read-only consent: maximum 90 days; no password/PIN/OTP/CVV; no payment authority.
- AI memory default OFF.
- Money-send card is never part of signup.
- Back / close / home / timeout / app close = decline; partial OAuth, partial bank-link or partial memory grant leaves no consent behind.
- One click = one task + one permission, never bundled permanent consent.

## Auth-button implementation rule
A sign-in control must not exist on Screen 1 unless the server confirms that the complete auth method is actually ready. “Configured” means the complete provider path exists (authorization/PKCE or OTP start, callback/verification, state/nonce protection where applicable, and server-side configuration). A placeholder, environment flag alone, or future plan is not enough.

Current Wave-1 sandbox state:
- Google OAuth: not ready → do not render.
- X OAuth: not ready → do not render.
- Phone OTP: not ready → do not render.
- Sandbox password fallback: ready for sandbox only.

No fake OAuth success states, demo provider buttons, or credentials are allowed.