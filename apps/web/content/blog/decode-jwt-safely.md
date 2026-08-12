---
title: How to Decode a JWT Without Pasting It Into a Random Website
description: JWT payloads often contain more than you expect. Here's what's inside a token, why pasting one into an online decoder is risky, and how to inspect it locally.
category: Developer Tools
tool: jwt
date: 2026-07-29
---

Every developer who works with authentication ends up staring at a JSON Web Token sooner or later — a long, opaque string of dots and gibberish — and needing to know what is inside it. The reflex is to search "JWT decoder", paste the token into the first result, and read off the claims. That reflex is worth reconsidering.

## What a JWT actually is

A JWT is three Base64URL-encoded parts joined by dots: `header.payload.signature`.

- The **header** says how the token is signed — for example `{"alg":"HS256","typ":"JWT"}`.
- The **payload** carries the claims: who the token is for, when it expires, and often application-specific data like user id, email, roles, or tenant.
- The **signature** is a cryptographic check computed over the header and payload with a secret or private key. It lets a server confirm the token has not been tampered with.

The crucial thing to understand is that the header and payload are only **encoded**, not encrypted. Base64URL is a reversible transformation, not a lock. Anyone holding the token can read the first two parts — no secret required. The signature protects *integrity* (it stops someone altering the claims), but it does nothing to hide them.

## Why "just decode it online" is quietly risky

Because the payload is readable, decoding a JWT is trivial. The risk is not the decoding — it is *where* you do it.

A JWT is a live credential. While it is valid, it often grants exactly the access its owner has. And payloads routinely contain more than people expect: email addresses, internal user ids, role and permission lists, tenant or org identifiers, and sometimes feature flags or session details that map your internal model for anyone reading them.

When you paste that token into a random web decoder, you are handing all of it — and, for the token's remaining lifetime, potentially the access it represents — to a third-party server you know nothing about. Even reputable-looking sites can log input. For a token from a production system, that is an avoidable data leak and, occasionally, a genuine security incident.

## The safer way: decode locally

The fix is simple: decode the token somewhere it does not leave your machine.

Our [JWT tool](/jwt) does exactly that. Paste a token and it splits and Base64URL-decodes the header and payload right in your browser tab, showing you the formatted JSON. Nothing is transmitted — you can confirm it by opening your browser's Network panel and watching it stay silent as you decode. The same tool can also *generate* and HMAC-sign a token locally when you need a test credential, so the whole encode/decode loop happens on your device.

Because the work is local, it is safe to inspect production tokens, tokens containing customer data, and tokens you would never dream of pasting into a search-result website.

## Common JWT debugging tasks

Once you can read a token safely, most day-to-day debugging is quick:

- **Checking expiry.** The `exp` claim is a Unix timestamp (seconds since 1970). If it is in the past, the token is expired — often the real cause of a mysterious 401. The `iat` (issued-at) and `nbf` (not-before) claims tell a similar story.
- **Confirming claims.** Verify that `sub`, `aud`, roles, and any custom fields hold what your application expects. A surprising number of "permission" bugs are just a missing or misspelled claim.
- **Reading the algorithm.** The header's `alg` tells you how the token is signed. If you ever see `alg: none`, treat it as a red flag — historically it has been abused to forge unsigned tokens.

## FAQ

### Can I verify a JWT's signature without the secret?

No. Verifying the signature requires the signing key — the shared secret for HMAC algorithms (HS256/384/512) or the public key for asymmetric ones (RS256, ES256). A local decoder can *read* the header and payload without any key, which is enough for inspection, but confirming the token is authentic is a separate step that needs the key and belongs on your server.

### Is a JWT encrypted or just encoded?

Just encoded, in the standard case. A normal signed JWT (a "JWS") has a readable header and payload — the signature guarantees they have not been changed, not that they are hidden. There is a separate encrypted variant (JWE) that does conceal its contents, but the everyday tokens you get from most auth systems are signed, not encrypted. Never put anything in a payload you would not want the token's holder to read.

### Why is my token rejected even though the claims look right?

Common culprits: an expired `exp`, a clock skew between the issuer and verifier, a mismatched `aud` (audience) or `iss` (issuer), or the token being signed with a key the verifier does not have. Decoding locally lets you check the claims and timing first, before you go hunting for a key problem.

Need to look inside a token right now? Open the [JWT tool](/jwt) — it decodes and signs entirely in your browser, so even production tokens stay on your machine.
