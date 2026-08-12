/**
 * Pure parsing for the Markdown blog (no filesystem, no rendering here — the
 * app's `src/lib/blog.ts` reads the files, calls these, then renders the body).
 *
 * Frontmatter is a small flat `key: value` block between `---` fences (no YAML
 * dependency). The FAQ section is authored as normal Markdown — an `## FAQ`
 * heading followed by `### question` / answer pairs — and extracted here so the
 * same content both renders on the page and feeds FAQPage JSON-LD.
 */

export interface PostFrontmatter {
  title: string;
  description: string;
  category: string;
  /** Registry tool id this post links to (its "Try the tool" CTA). */
  tool: string;
  /** Publish date, `YYYY-MM-DD`. Used for ordering and metadata, never the URL. */
  date: string;
  /** Optional last-updated date, `YYYY-MM-DD`. */
  updated?: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface ParsedPost {
  frontmatter: PostFrontmatter;
  /** Markdown body with the frontmatter block stripped. */
  body: string;
  faqs: Faq[];
  readingMinutes: number;
}

const REQUIRED_FIELDS: (keyof PostFrontmatter)[] = [
  'title',
  'description',
  'category',
  'tool',
  'date',
];

/** Split a `---`-fenced frontmatter block from the body. Throws if malformed. */
export function parseFrontmatter(raw: string): {
  data: Record<string, string>;
  body: string;
} {
  const normalized = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(normalized);
  if (!match) {
    throw new Error('Post is missing its --- frontmatter block.');
  }
  const [, block, body] = match as unknown as [string, string, string];
  const data: Record<string, string> = {};
  for (const line of block.split('\n')) {
    if (!line.trim()) continue;
    const colon = line.indexOf(':');
    if (colon === -1) throw new Error(`Malformed frontmatter line: "${line}"`);
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    // Strip a single pair of surrounding quotes, if present.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, body: body.trim() };
}

/**
 * Extract FAQ pairs from the `## FAQ` section: each `### question` heading and
 * the Markdown that follows it, up to the next `###` or the next `##` section.
 * Returns `[]` when there is no FAQ section.
 */
export function extractFaqs(body: string): Faq[] {
  const lines = body.split('\n');
  const start = lines.findIndex((l) => /^##\s+FAQ\s*$/i.test(l.trim()));
  if (start === -1) return [];

  const faqs: Faq[] = [];
  let q: string | null = null;
  let answer: string[] = [];

  const flush = () => {
    if (q !== null) {
      const a = answer.join('\n').trim();
      if (a) faqs.push({ q, a });
    }
    q = null;
    answer = [];
  };

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]!;
    const trimmed = line.trim();
    // A new top-level section ends the FAQ block.
    if (/^##\s+/.test(trimmed) && !/^###\s+/.test(trimmed)) {
      flush();
      break;
    }
    const qMatch = /^###\s+(.*)$/.exec(trimmed);
    if (qMatch) {
      flush();
      q = qMatch[1]!.trim();
      continue;
    }
    if (q !== null) answer.push(line);
  }
  flush();
  return faqs;
}

/** Rough reading time in whole minutes at ~200 words/min (min 1). */
export function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Parse a full post file into validated frontmatter, body, and FAQs. */
export function parsePost(raw: string): ParsedPost {
  const { data, body } = parseFrontmatter(raw);
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) throw new Error(`Post frontmatter is missing "${field}".`);
  }
  const frontmatter: PostFrontmatter = {
    title: data.title!,
    description: data.description!,
    category: data.category!,
    tool: data.tool!,
    date: data.date!,
    ...(data.updated ? { updated: data.updated } : {}),
  };
  return {
    frontmatter,
    body,
    faqs: extractFaqs(body),
    readingMinutes: estimateReadingMinutes(body),
  };
}
