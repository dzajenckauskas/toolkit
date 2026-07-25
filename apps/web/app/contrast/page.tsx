import type { Metadata } from 'next';
import ContrastChecker from '@/components/ContrastChecker';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Color Contrast Checker (WCAG) — Free Tools',
  description: 'Check color contrast against WCAG AA/AAA in your browser.',
};

export default function ContrastPage() {
  return (
    <ToolPage toolId="contrast">
      <ContrastChecker />
    </ToolPage>
  );
}
