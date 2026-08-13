---
title: How to Verify a Download With a Checksum (SHA-256)
description: That SHA-256 string next to a download lets you confirm a file arrived intact and untampered. Here's what a checksum proves and how to verify one yourself.
category: Developer Tools
tool: checksum
date: 2026-07-01
keywords: checksum, sha-256, verify download, file hash, integrity, hash verification
---

Download an installer, a Linux ISO, or a release binary and you will often see a long hexadecimal string nearby labelled "SHA-256" — or a `checksums.txt` file sitting next to the download. Most people ignore it. It is, quietly, one of the most useful trust signals on the internet, and checking it takes seconds.

## What a checksum actually proves

A checksum is the output of a **cryptographic hash function** — SHA-256 is the common choice — run over the file's bytes. A hash has two properties that make it useful here:

1. **Deterministic:** the same file always produces the same hash.
2. **Avalanche effect:** change a single byte and the hash changes completely and unpredictably.

So when a project publishes the SHA-256 of a release, they are publishing a compact fingerprint of the exact bytes they shipped. If you hash your downloaded copy and get the **same** string, you have strong evidence that your file is byte-for-byte identical to theirs. If it differs by even one character, something is wrong.

That "something" comes in two flavors:

- **Corruption** — an interrupted or flaky download, a bad mirror, a flipped bit. Harmless in intent, but you do not want to install a truncated binary.
- **Tampering** — a compromised mirror or a man-in-the-middle serving a modified file with malware added. This is the case that matters, and it is exactly what a checksum is designed to catch.

## How to verify one

The process is simple:

1. Download the file.
2. Compute its SHA-256 hash.
3. Compare that hash, character for character, against the value the project published.

If they match, you are done. If they do not, delete the file and download it again from the official source — and if it still does not match, treat the source as suspect.

Traditionally step 2 means a command line: `shasum -a 256 file` on macOS/Linux or `Get-FileHash` in PowerShell. That is fine, but it is friction, and it is why most people skip the check entirely.

## Do it in your browser — the file never uploads

Our [file checksum verifier](/checksum) removes the friction. Drop in a file and it computes the SHA-256 (and other digests) locally using the browser's built-in Web Crypto API. Crucially, **the file never leaves your device** — there is no upload, so it is safe to verify sensitive files, and you can confirm the lack of network activity in your browser's Network panel. Paste the published hash and compare, or read off the computed value and check it by eye.

For a genuinely tamper-proof check, get the expected hash from a trusted channel — the project's HTTPS website or signed release notes — not from the same mirror that served the file.

## FAQ

### What if the checksum doesn't match?

Do not use the file. A mismatch means the bytes you have are not the bytes the project published — most often an incomplete or corrupted download, occasionally a tampered one. Re-download from the official source and check again. If it still fails, stop and investigate the source rather than the file; something between you and the publisher is altering it.

### Is SHA-256 better than MD5 or SHA-1?

For security, yes, and it is not close. MD5 and SHA-1 are both **broken** for tamper-detection: attackers can deliberately craft two different files with the same MD5 or SHA-1 hash, so a match no longer proves authenticity. SHA-256 has no such practical weakness and is the modern default. If a project only offers MD5, treat it as a corruption check, not a security guarantee.

### Does a matching checksum mean the file is safe?

It means the file is **authentic** — identical to what the publisher released — not that the publisher's file is free of bugs or malware. A checksum verifies integrity, not intent. It proves nobody altered the file in transit; it says nothing about whether you should trust the source in the first place. Pair it with getting the expected hash from a trustworthy channel.

Need to verify a download now? Open the [file checksum verifier](/checksum) — it hashes files in your browser, so nothing is uploaded.
