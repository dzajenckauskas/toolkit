import { describe, expect, it } from 'vitest';
import { getToolContent } from './content';
import { TOOLS, type Tool } from './registry';

describe('tool content', () => {
  it('does not manufacture generic sections for tools without authored guidance', () => {
    // A tool with no BESPOKE entry falls back to its registry description and
    // renders no walkthrough, highlights or FAQs. Use a synthetic id so the
    // contract is tested even once every shipped tool has authored content.
    const unauthored: Tool = {
      id: '__no_such_tool__',
      name: 'Unauthored',
      description: 'A tool with no authored landing content.',
      href: '/__no_such_tool__',
      category: 'Developer',
      status: 'live',
    };

    expect(getToolContent(unauthored)).toEqual({
      tagline: unauthored.description,
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
