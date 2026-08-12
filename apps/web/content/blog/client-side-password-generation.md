---
title: Why Your Password Generator Should Never Touch a Server
description: A password generator that sends your request to a server could log the password it just made for you. Here's why client-side generation and real randomness matter.
category: Privacy & Security
tool: password
date: 2026-08-05
---

Here is an uncomfortable question about the free "strong password generator" you found through a search: where was that password actually created? If the answer is "on someone else's server", then for a brief moment your brand-new password existed on a computer you do not control — and nothing stops that computer from writing it to a log.

Most people never think to ask. The page looks harmless, the password appears, you copy it. But a credential is only useful because it is secret, and a generator that transmits it has quietly broken that premise before you even use it.

## The problem with server-side generation

When a tool generates a password on its server, the value travels back to your browser over the network, and the server had the plaintext in memory to send it. Whether it *keeps* that value is entirely a matter of trust — trust in a site you likely landed on from a search result and will never visit again. Even with good intentions, server logs, analytics, and error trackers routinely capture request and response data by accident.

Client-side generation removes the question altogether. If the password is created in your browser using JavaScript and never sent anywhere, there is no server copy to leak, log, or subpoena. You are not trusting a promise; you are relying on the fact that the value physically never left your machine.

## Not all randomness is equal

There is a second, quieter problem: *how* the random characters are chosen.

Browsers expose two very different sources of randomness. `Math.random()` is fast and convenient, but it is a **pseudo-random** generator never intended for security — its output can be predictable, and in some cases a few sample values are enough to reconstruct the sequence. Alarmingly, plenty of throwaway generator pages use exactly this function.

The right tool for the job is `crypto.getRandomValues()`, part of the Web Crypto API. It draws from the operating system's **cryptographically secure** random source — the same class of randomness used for encryption keys. To a person the two look identical; to an attacker trying to predict your password, the difference is everything.

Our [password generator](/password) uses `crypto.getRandomValues()` and runs entirely in your browser. Every character comes from that secure source, and no request is made to any server while you generate.

## How to verify a tool is really client-side

You do not have to take anyone's word for it, including ours. Open your browser's developer tools, switch to the **Network** tab, and click "generate". A genuinely client-side tool produces **no new network activity** — the list stays empty. If you see a request fire off each time you generate, the password is being made somewhere else and sent to you. That single check tells you more than any marketing copy on the page.

## Practical guidance: what actually makes a password strong

With the plumbing sorted, the strategy is simple:

- **Length beats complexity.** Each additional character multiplies the number of possibilities far more than swapping a letter for a symbol does. A long password made of random words can be both stronger and easier to type than a short jumble of symbols.
- **Passphrases are a legitimate choice.** A handful of unrelated random words is genuinely strong and far easier to enter on a phone or a TV login screen.
- **Reuse is the real danger.** The most common way accounts are compromised is not a cracked password but a *reused* one exposed in some other site's breach. A unique password per account matters more than squeezing out extra entropy on any single one.
- **Store them in a manager.** Unique, high-entropy passwords are only practical if you are not trying to remember them. Generate, save to a password manager, move on.

The takeaway is small but worth internalising: a password generator is one of the few tools where *where the code runs* is a security property, not an implementation detail. Prefer the ones that run in your browser and use real randomness — and verify it in the Network tab if you are unsure.

## FAQ

### Is a longer password always better?

Almost always, yes — length is the single most effective lever, because it increases the search space exponentially. A 20-character password is dramatically harder to brute-force than a 10-character one, even if the shorter one uses more symbol types. The main practical limit is a site that caps password length, which is itself a small red flag.

### Should I trust my browser's built-in password generator?

For most people, yes. Browser and operating-system password managers generate strong, unique passwords using secure randomness and store them for you. A dedicated generator like this one is useful when you want a password outside that flow — for a device, a script, or a service your manager does not cover.

### What about password managers — do I still need to generate manually?

A password manager that offers to create and save passwords is doing exactly the right thing; lean on it. A standalone generator complements it for the cases it does not reach, and it is handy when you want to see and tune the length or character set before committing.

Want a password made securely on your own device? Open the [password generator](/password) — it uses `crypto.getRandomValues()` and never sends anything to a server.
