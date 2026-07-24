import { describe, expect, it } from 'vitest';
import { decodeHtml, encodeHtml } from './html-entities';

describe('html-entities', () => {
  it('encodes the five HTML-significant characters', () => {
    expect(encodeHtml('<a href="x">Tom & Jerry\'s</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;',
    );
  });

  it('decodes named entities', () => {
    expect(decodeHtml('&lt;b&gt;a &amp; b&lt;/b&gt;')).toBe('<b>a & b</b>');
    expect(decodeHtml('&copy; &mdash; &euro;')).toBe('© — €');
  });

  it('decodes numeric references (decimal and hex)', () => {
    expect(decodeHtml('&#65;&#66;')).toBe('AB');
    expect(decodeHtml('&#x41;&#x42;')).toBe('AB');
  });

  it('leaves unknown entities untouched', () => {
    expect(decodeHtml('&notanentity;')).toBe('&notanentity;');
  });

  it('round-trips the significant characters', () => {
    const text = `<>&"'`;
    expect(decodeHtml(encodeHtml(text))).toBe(text);
  });
});
