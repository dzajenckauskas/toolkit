import type { Metadata } from 'next';
import ThemeMaker from '@/components/ThemeMaker';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Color Theme Maker — Free Tools',
  description: 'Build a light/dark color theme from an accent and export CSS variables.',
};

export default function ThemeMakerPage() {
  return (
    <ToolPage toolId="theme-maker">
      <ThemeMaker />
    </ToolPage>
  );
}
