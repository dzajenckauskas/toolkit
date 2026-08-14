---
title: What Is a TOTP Code, and How Do Authenticator Apps Actually Work?
description: Authenticator codes aren't sent to you — your phone computes them from a shared secret and the current time. How TOTP works, and why it beats SMS.
category: Privacy & Security
tool: totp
date: 2026-07-22
keywords: totp, two-factor authentication, 2fa, authenticator app, one-time password, otp
---

When you enable two-factor authentication and an app like Google Authenticator starts showing a rotating six-digit code, it feels a little like magic. The code changes every 30 seconds, it works even in airplane mode, and somehow the website you are logging into knows exactly what number your phone is showing. Nothing is being sent anywhere — so how does it line up?

The answer is a small, elegant standard called **TOTP**, and once you see how it works the magic turns into something you can reason about.

## The core idea: shared secret plus time

TOTP stands for **Time-based One-Time Password** (RFC 6238). When you scan that QR code during setup, you are not registering a device — you are copying a **shared secret**, a random string of bytes, onto your phone. The server keeps the same secret.

From then on, both sides run the exact same calculation:

1. Take the current time and divide it into 30-second windows (the number of 30-second steps since 1 January 1970).
2. Combine that time-step number with the shared secret using **HMAC** — a keyed hash function.
3. Truncate the result down to a six-digit number.

Because your phone and the server share the same secret and both know the current time, they independently arrive at the **same** six digits without ever talking to each other. The code was never transmitted; it was computed in two places at once. That is why it works offline.

## Why codes expire every 30 seconds

The 30-second window is what makes the code "one-time". At the top of each window both sides compute a new number, so a code you read is only valid for that short slice of time. Even if someone glimpses it over your shoulder or intercepts it, it is worthless moments later.

This is also why TOTP is a real security upgrade over **SMS codes**. A texted code travels over the phone network, where it can be intercepted, and it is tied to your phone number — which an attacker can hijack through a SIM-swap. A TOTP secret never leaves your device after setup, so there is no code in transit to steal and no phone number to hijack.

## What "clock drift" means

Because the whole scheme depends on time, both sides need roughly the same clock. If your phone's time is off by a couple of minutes, the code it computes will belong to a different window than the one the server expects, and logins will fail. In practice servers allow a small grace window (usually the step before and after) to absorb minor drift, and phones keep their clocks synced automatically, so this rarely bites. If your codes stop being accepted, the first thing to check is your device's clock.

## Try it yourself, locally

The best way to understand TOTP is to watch it happen. Our [TOTP / 2FA generator](/totp) takes a Base32 secret and shows you the current six-digit code and the seconds until it rolls over — the same computation your authenticator app performs. It runs entirely in your browser: the secret you type is never sent to a server, which also makes the tool safe for developers testing their own authentication flow without wiring up a phone.

Paste a test secret, watch the code tick over every 30 seconds, and the "magic" becomes a mechanism you can trust.

## FAQ

### Is this the same thing as Google Authenticator?

Yes, in the sense that matters. Google Authenticator, Authy, 1Password, Microsoft Authenticator and most others all implement the same TOTP standard (RFC 6238). A secret set up for one will produce identical codes in another, which is why you can usually move between apps by re-scanning or exporting your secrets.

### Can two devices generate the same code at the same time?

Yes — and that is by design. If you install the same secret on two devices, both will compute the identical code for each time window, because the calculation depends only on the secret and the clock, not on the device. This is exactly how "backup" authenticator setups work.

### My codes suddenly stopped working. Why?

The most common cause is clock drift — your device's time has slipped far enough that it is computing codes for the wrong 30-second window. Enabling automatic date and time on your phone usually fixes it. Less commonly, the secret was mis-entered during setup, in which case the codes were never going to match.

Curious to see a code compute in real time? Open the [TOTP / 2FA generator](/totp) — it runs in your browser, so the secret never leaves your device.
