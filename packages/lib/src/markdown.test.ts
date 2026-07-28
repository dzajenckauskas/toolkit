import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

describe('markdown', () => {
  it('renders headings, emphasis and lists', () => {
    expect(renderMarkdown('# Title')).toContain('<h1>Title</h1>');
    expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>');
    expect(renderMarkdown('- a\n- b')).toContain('<li>a</li>');
  });

  it('does not pass through raw HTML (XSS-safe)', () => {
    const out = renderMarkdown('<script>alert(1)</script>');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });

  it('linkifies bare URLs', () => {
    expect(renderMarkdown('see https://example.com')).toContain('<a href="https://example.com"');
  });
});
