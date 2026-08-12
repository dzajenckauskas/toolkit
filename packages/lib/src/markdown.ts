/**
 * Markdown rendering via markdown-it. Raw HTML is disabled (`html: false`) so
 * user input can't inject markup — the output is safe to render directly.
 */

import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
});

export function renderMarkdown(source: string): string {
  return md.render(source);
}

// Article/blog rendering: standard Markdown semantics (a single newline is a
// soft wrap, not a hard <br>), still HTML-safe. Separate instance so the
// interactive Markdown tool's `breaks: true` behaviour is unaffected.
const article = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: false,
});

export function renderArticleHtml(source: string): string {
  return article.render(source);
}
