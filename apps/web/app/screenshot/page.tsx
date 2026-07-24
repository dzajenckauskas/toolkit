import type { Metadata } from 'next';
import ScreenshotBeautifier from '@/components/ScreenshotBeautifier';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Screenshot Beautifier — Free Tools',
  description: 'Add a background, padding, rounded corners and shadow to a screenshot, in-browser.',
};

export default function ScreenshotPage() {
  return (
    <Page>
      <header>
        <Heading>Screenshot Beautifier</Heading>
        <Text tone="muted">Frame a screenshot with a background, padding, corners and shadow.</Text>
      </header>
      <ScreenshotBeautifier />
    </Page>
  );
}
