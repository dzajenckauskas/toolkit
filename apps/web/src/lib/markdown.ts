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
