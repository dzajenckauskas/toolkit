import { describe, expect, it } from 'vitest';
import { estimateReadingMinutes, extractFaqs, parseFrontmatter, parsePost } from './blog';

const POST = `---
title: "Remove GPS Location From Photos"
description: A photo can leak your address.
category: Privacy & Security
tool: metadata-cleaner
date: 2026-08-12
---

Intro paragraph.

## What EXIF contains

Body text here.

## FAQ

### Does this affect photo quality?

No. Only the metadata is removed; the pixels are untouched.

### Does it work on iPhone exports?

Yes — HEIC and JPEG both carry EXIF.

## Related

Not a FAQ.
`;

describe('blog frontmatter', () => {
  it('splits the frontmatter block from the body and strips quotes', () => {
    const { data, body } = parseFrontmatter(POST);
    expect(data.title).toBe('Remove GPS Location From Photos');
    expect(data.tool).toBe('metadata-cleaner');
    expect(data.category).toBe('Privacy & Security');
    expect(body.startsWith('Intro paragraph.')).toBe(true);
  });

  it('throws when the frontmatter block is missing', () => {
    expect(() => parseFrontmatter('no frontmatter here')).toThrow(/frontmatter/);
  });

  it('requires the mandatory fields', () => {
    expect(() => parsePost('---\ntitle: x\n---\nbody')).toThrow(/description/);
  });
});

describe('extractFaqs', () => {
  it('pulls question/answer pairs from the FAQ section only', () => {
    const faqs = extractFaqs(parseFrontmatter(POST).body);
    expect(faqs).toHaveLength(2);
    expect(faqs[0]!.q).toBe('Does this affect photo quality?');
    expect(faqs[0]!.a).toContain('the pixels are untouched');
    expect(faqs[1]!.q).toBe('Does it work on iPhone exports?');
    // Content after the next ## section is not swept into the last answer.
    expect(faqs[1]!.a).not.toContain('Not a FAQ');
  });

  it('returns [] when there is no FAQ section', () => {
    expect(extractFaqs('# Title\n\nJust prose, no FAQ.')).toEqual([]);
  });
});

describe('estimateReadingMinutes', () => {
  it('is at least one minute and scales with length', () => {
    expect(estimateReadingMinutes('one two three')).toBe(1);
    expect(estimateReadingMinutes(Array(600).fill('word').join(' '))).toBe(3);
  });
});
