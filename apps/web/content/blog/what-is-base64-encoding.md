---
title: What Is Base64 Encoding (and Why It's Not Encryption)
description: Base64 turns binary data into plain text so it can travel through systems built for text. Here's what it does, why it makes data bigger, and why it offers no security at all.
category: Developer Tools
tool: base64
date: 2026-07-08
keywords: base64, encoding, base64url, data uri, binary to text, decode base64
---

Base64 is one of those things every developer uses constantly and few stop to examine. It shows up in data URIs, email attachments, JSON payloads, JWTs, and config files. It is genuinely useful — and it is also widely misunderstood, in a way that occasionally causes real security mistakes. Let us clear both up.

## The problem Base64 solves

Many systems were designed to carry **text**, not arbitrary binary data. Email is the classic example: the protocols underneath it expect printable characters, and raw bytes — an image, a compiled file — can contain values that those systems mangle or treat as control signals.

Base64 is a **text-safe representation of binary data**. It maps every group of 3 bytes (24 bits) onto 4 characters drawn from a 64-symbol alphabet: `A–Z`, `a–z`, `0–9`, and two extras (`+` and `/`), with `=` used as padding. Because those characters survive any text channel intact, you can drop binary data into places that only accept text and get it back byte-for-byte on the other side.

## Why Base64 makes data bigger

There is a cost: 3 bytes become 4 characters, so Base64 output is about **33% larger** than the input. That is inherent to the scheme — you are spending size to buy text-safety. It is why you would not Base64-encode a large file "just in case", and why data URIs are best reserved for small assets like icons rather than big images.

## Encoding is not encryption — this part matters

Here is the misconception that causes trouble: **Base64 is not encryption, and it provides no security whatsoever.** It is a reversible, keyless transformation. Anyone can decode a Base64 string in seconds — there is no secret involved, because there is no secret *possible*. The alphabet and the rules are public.

This trips people up because Base64 output *looks* scrambled and unreadable. But "looks random to a human" is not security. If you Base64-encode a password, an API key, or personal data and store or transmit it thinking it is now protected, you have protected nothing — you have merely changed its costume. The moment anyone runs it through a decoder, the original is right there.

If you actually need to hide data, you need **encryption** (a real algorithm with a key, like AES) — and if you only need to store a password for later comparison, you need **hashing**. Base64 is neither. Its job is transport and embedding, full stop.

## Common places you'll meet it

- **Data URIs** — `data:image/png;base64,...` embeds a small image directly in HTML or CSS, saving a request.
- **JWTs** — the header and payload of a token are Base64URL-encoded (a URL-safe variant that swaps `+`/`/` for `-`/`_` and drops padding), which is exactly why anyone can read a token's claims without a key.
- **Email attachments**, **basic-auth headers**, and countless config and API formats that need to carry binary in a text field.

Our [Base64 tool](/base64) encodes and decodes both directions in your browser — handy for inspecting a data URI, decoding a token segment, or checking what a Base64 blob in a config file actually contains. Since it runs locally, you can safely paste values you would not want to send to someone else's server.

## FAQ

### Is Base64 a form of compression?

No — the opposite. Base64 makes data roughly a third *larger*, because it trades three bytes for four text characters. Compression reduces size by finding redundancy; Base64 adds size to gain text-safety. If you need something smaller, compress first, then Base64-encode the compressed result if a text channel requires it.

### Is it safe to store passwords or secrets in Base64?

No. Base64 offers zero confidentiality — decoding it requires no key and takes an instant. Treat a Base64 string as fully readable. For secrets you need to conceal, use encryption; for passwords you need to verify later, use a hashing function. Base64 is for transport, not protection.

### What's the difference between Base64 and Base64URL?

They are almost identical. Standard Base64 uses `+` and `/` and pads with `=`. Those characters are awkward in URLs, so **Base64URL** replaces `+` with `-`, `/` with `_`, and usually omits the padding. It is the variant used in JWTs and other URL- and filename-safe contexts. The underlying idea — 3 bytes to 4 characters — is the same.

Need to encode or decode something right now? Open the [Base64 tool](/base64) — it works in both directions, entirely in your browser.
