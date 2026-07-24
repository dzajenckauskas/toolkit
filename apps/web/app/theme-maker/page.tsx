import type { Metadata } from 'next';
import ThemeMaker from '@/components/ThemeMaker';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Color Theme Maker — Free Tools',
  description: 'Build a light/dark color theme from an accent and export CSS variables.',
};

export default function ThemeMakerPage() {
  return (
    <Page>
      <header>
        <Heading>Color Theme Maker</Heading>
        <Text tone="muted">
          Build a matching light &amp; dark theme from one accent, then export CSS variables.
        </Text>
      </header>
      <ThemeMaker />
    </Page>
  );
}
