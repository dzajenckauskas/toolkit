import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parsePost, type Faq } from '@toolkit/lib/blog';
import { renderArticleHtml } from '@toolkit/lib/markdown';
import { TOOLS } from '@toolkit/tools/registry';

/**
 * Build-time blog loader. Reads the Markdown posts in `content/blog/`, parses
 * their frontmatter/FAQs (pure logic in `@toolkit/lib/blog`), renders the body,
 * and resolves each post's linked tool from the registry. Everything runs at
 * build time — the routes are statically generated, nothing ships to the client
 * beyond the rendered HTML.
 */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  updated?: string;
  tool: { id: string; name: string; href: string };
  bodyHtml: string;
  faqs: Faq[];
  readingMinutes: number;
}

const BLOG_DIR = join(process.cwd(), 'content', 'blog');

function loadPost(fileName: string): BlogPost {
  const slug = fileName.replace(/\.md$/, '');
  const raw = readFileSync(join(BLOG_DIR, fileName), 'utf8');
  const { frontmatter, body, faqs, readingMinutes } = parsePost(raw);

  const tool = TOOLS.find((t) => t.id === frontmatter.tool);
  if (!tool) {
    // A post pointing at an unknown tool id is a build-time mistake — fail loud.
    throw new Error(`Blog post "${slug}" references unknown tool id "${frontmatter.tool}".`);
  }

  return {
    slug,
    title: frontmatter.title,
    description: frontmatter.description,
    category: frontmatter.category,
    date: frontmatter.date,
    ...(frontmatter.updated ? { updated: frontmatter.updated } : {}),
    tool: { id: tool.id, name: tool.name, href: tool.href },
    bodyHtml: renderArticleHtml(body),
    faqs,
    readingMinutes,
  };
}

let cache: BlogPost[] | null = null;

/** All posts, newest first. */
export function getAllPosts(): BlogPost[] {
  if (!cache) {
    const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
    cache = files.map(loadPost).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }
  return cache;
}

export function getPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/** Posts sharing a category (excluding `slug`), newest first, capped at `limit`. */
export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const post = getPostBySlug(slug);
  if (!post) return [];
  return getAllPosts()
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, limit);
}
