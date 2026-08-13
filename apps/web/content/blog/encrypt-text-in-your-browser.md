---
title: How to Encrypt a Note in Your Browser With AES-256-GCM
description: Encrypt a message locally with a passphrase and share only the result — no app, no account, no server. How AES-256-GCM works, and where its real weak point is.
category: Privacy & Security
tool: encrypt
date: 2026-06-24
keywords: aes-256-gcm, encrypt text, client-side encryption, passphrase, authenticated encryption
---

Sometimes you need to send something sensitive — a password, a recovery phrase, a private note — through a channel you do not fully trust, like chat or email. The right tool is encryption: scramble the message so that only someone with the passphrase can read it. What surprises people is that you do not need an app, an account, or a server to do it. A modern browser has industrial-strength encryption built in.

## What AES-256-GCM actually gives you

AES is the **Advanced Encryption Standard**, the symmetric cipher used everywhere from HTTPS to disk encryption. "256" is the key size in bits, and **GCM** (Galois/Counter Mode) is the mode of operation. That last part matters more than it sounds, because GCM is **authenticated encryption** — it provides two guarantees at once:

- **Confidentiality:** without the key, the ciphertext reveals nothing about the message.
- **Integrity and authenticity:** if the ciphertext is altered — even a single byte flipped — decryption **fails loudly** instead of silently producing garbage. You cannot be tricked into trusting a tampered message.

"Symmetric" means the same secret both locks and unlocks the data. In practice you do not hand someone a raw 256-bit key; you choose a **passphrase**, and the tool stretches it into a proper key using a **key-derivation function** (such as PBKDF2) with a random salt. That stretching deliberately makes brute-forcing the passphrase slow.

## Why doing it in the browser is the point

Encryption is only as trustworthy as the place it happens. If a website encrypts your note **on its server**, then for a moment your plaintext — and possibly your passphrase — existed on a machine you do not control. That defeats much of the purpose.

Our [text encrypt / decrypt tool](/encrypt) runs entirely in your browser using the Web Crypto API. You type a message and a passphrase, and the encryption happens locally; only the resulting ciphertext is produced. Nothing — not the message, not the passphrase, not the key — is ever sent anywhere, which you can confirm by watching your browser's Network panel stay silent. You copy the encrypted blob, send *that* through your untrusted channel, and the recipient decrypts it locally with the same passphrase.

## The real weak point: the passphrase and how you share it

AES-256 is not the part that breaks. In real life, encrypted messages are compromised in two mundane ways, and both are on you rather than the algorithm:

- **A weak passphrase.** The cipher is unbreakable; a guessable passphrase is not. "summer2024" undoes everything. Use something long and unpredictable — a random passphrase or a string of unrelated words.
- **Sending the key badly.** If you encrypt a note and then paste the passphrase into the *same chat thread*, you have handed both halves to anyone reading it. The passphrase must travel by a **different channel** than the ciphertext — say the message by email and the passphrase by phone, or agree on it in person beforehand.

Get those two things right and browser-based AES-256-GCM is genuinely strong, private encryption that costs nothing and trusts no one.

## FAQ

### Is browser encryption really as secure as a dedicated app?

The cryptography is the same. The Web Crypto API implements AES-256-GCM to the same standard as native applications, and it runs in a vetted browser engine. The variables that decide real-world security — the strength of your passphrase and how carefully you share it — are identical whether you use a browser tool or an installed app. A local browser tool simply avoids sending your data to a server.

### What happens if I forget the passphrase?

The message is unrecoverable, and that is by design. There is no backdoor, no "reset", and no copy of the key held anywhere — the whole point of client-side encryption is that only the passphrase unlocks the data. Store the passphrase somewhere safe (a password manager) before you rely on it, because nobody, including the tool's author, can help you recover a lost one.

### Can I send the encrypted text over any channel?

Yes — that is the advantage. Once a message is encrypted, the ciphertext is safe to send over chat, email, a shared document, or anywhere else, because it is meaningless without the passphrase. The one rule is to send the **passphrase separately**, through a different channel, so a single compromised inbox or thread never contains both halves.

Want to encrypt a note right now? Open the [text encrypt / decrypt tool](/encrypt) — it uses AES-256-GCM in your browser, so nothing leaves your device.
