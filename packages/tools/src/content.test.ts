import { describe, expect, it } from 'vitest';
import { getToolContent } from './content';
import { TOOLS } from './registry';

describe('tool content', () => {
  it('does not manufacture generic sections for tools without authored guidance', () => {
    const uuid = TOOLS.find((tool) => tool.id === 'uuid')!;

    expect(getToolContent(uuid)).toEqual({
      tagline: uuid.description,
      steps: [],
      highlights: [],
      faqs: [],
    });
  });

  it('keeps only the sections explicitly authored for a tool', () => {
    const textDiff = TOOLS.find((tool) => tool.id === 'text-diff')!;
    const content = getToolContent(textDiff);

    expect(content.steps).toHaveLength(3);
    expect(content.highlights).toEqual([]);
    expect(content.faqs).toEqual([]);
  });
});
