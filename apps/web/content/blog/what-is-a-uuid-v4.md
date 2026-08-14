---
title: What Is a UUID (and When Should You Use Version 4)?
description: UUIDs let independent systems mint unique IDs with no coordination. Here's what the 128 bits mean and why v4 collisions are effectively impossible.
category: Developer Tools
tool: uuid
date: 2026-06-17
keywords: uuid, guid, uuid v4, unique identifier, uuid v7, random id
---

If you have worked with almost any database or API, you have seen them: strings like `f47ac10b-58cc-4372-a567-0e02b2c3d479`. That is a UUID — a Universally Unique Identifier — and its whole reason for existing is a small miracle of coordination-free design. Two machines that have never communicated can each generate one and be confident they will never clash.

## What the 128 bits mean

A UUID is a **128-bit** value, conventionally written as 32 hexadecimal digits in five hyphen-separated groups (`8-4-4-4-12`). A few of those bits are reserved to record the **version** (how the UUID was generated) and the **variant** (which layout standard it follows); the rest carry the actual identifying data.

That leaves an enormous space of possible values — on the order of 10^38. The size is the point: it is what lets a UUID be unique in practice without any central authority handing out numbers.

## Why version 4 collisions are effectively impossible

The most common kind you will meet is **version 4**, which fills its non-reserved bits with **random** data — 122 bits of it. No timestamp, no machine identifier, no counter: just randomness from a good source.

The obvious worry is: if it is random, could two UUIDs ever come out the same? Mathematically yes; practically no. With 122 random bits, you would need to generate on the order of a **billion UUIDs per second for about 85 years** before the probability of a single collision became meaningful. For any normal application the chance is so small it is not worth engineering around. This is why v4 is the pragmatic default: no coordination, no lookups, just generate and go.

The one caveat is the quality of the randomness. A v4 UUID is only as unique as its random source, so it should come from a **cryptographically secure** generator (`crypto.getRandomValues()` in the browser), not a weak `Math.random()`.

## v4 vs v1 vs v7 — which to reach for

Not all UUIDs are random, and the differences occasionally matter:

- **Version 1** encodes the **timestamp and the machine's network address**. It is time-ordered, which is nice for databases, but it can leak *when* and *where* an ID was created — a privacy consideration.
- **Version 4** is pure randomness. It leaks nothing and needs no coordination, at the cost of being unordered — which can fragment database indexes when used as a primary key.
- **Version 7** is the newer best-of-both: a **timestamp prefix** followed by random bits. IDs sort roughly by creation time (great for database locality) while staying unpredictable. If your database keys on UUIDs, v7 is increasingly the recommendation; for a general-purpose unique token, v4 remains the simplest safe choice.

## Generate them locally

Our [UUID generator](/uuid) produces version-4 UUIDs in your browser using secure randomness, one at a time or in a batch — handy for seeding test data, creating identifiers by hand, or grabbing a quick unique token. Because it runs locally, the values are generated on your device and never sent anywhere.

## FAQ

### Are UUIDs guaranteed to be unique?

Not *guaranteed* in the absolute sense — nothing random can be — but the probability of a version-4 collision is so vanishingly small that it is safe to treat them as unique for every practical purpose. You would have to generate them at an implausible rate for decades to make a single clash likely. The real risk is not chance but a bad random source, which is why secure generation matters.

### Is a UUID the same as a GUID?

Effectively yes. "GUID" (Globally Unique Identifier) is the name Microsoft uses for the same 128-bit concept. The terms are interchangeable in practice; you will see GUID in Microsoft-centric ecosystems and UUID almost everywhere else, but they describe the same thing.

### Should I use a UUID as a database primary key?

You can, with a caveat. Random version-4 UUIDs as primary keys can hurt write performance and index locality, because new rows land in random positions. If you want UUID keys, **version 7** — with its time-ordered prefix — largely solves that while keeping the benefits. For non-key identifiers, v4 is perfectly fine.

Need a unique identifier right now? Open the [UUID generator](/uuid) — it creates secure version-4 UUIDs in your browser.
