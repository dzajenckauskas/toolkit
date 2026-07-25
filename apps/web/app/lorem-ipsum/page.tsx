import type { Metadata } from 'next';
import LoremIpsum from '@/components/LoremIpsum';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Lorem Ipsum Generator — Free Tools',
  description: 'Generate placeholder text for layouts and mockups. No account, no upload.',
};

export default function LoremIpsumPage() {
  return (
    <ToolPage toolId="lorem-ipsum">
      <LoremIpsum />
    </ToolPage>
  );
}
