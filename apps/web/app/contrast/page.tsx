import type { Metadata } from 'next';
import ContrastChecker from '@/components/ContrastChecker';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Color Contrast Checker (WCAG) — Free Tools',
  description: 'Check color contrast against WCAG AA/AAA in your browser.',
};

export default function ContrastPage() {
  return (
    <Page>
      <header>
        <Heading>Color Contrast Checker</Heading>
        <Text tone="muted">Check text and background contrast against WCAG AA/AAA.</Text>
      </header>
      <ContrastChecker />
    </Page>
  );
}
