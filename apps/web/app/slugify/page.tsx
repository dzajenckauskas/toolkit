import type { Metadata } from 'next';
import Slugifier from '@/components/Slugifier';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Slugify — URL Slug Generator — Free Tools',
  description: 'Turn any text into a clean URL slug in your browser. No account, no upload.',
};

export default function SlugifyPage() {
  return (
    <ToolPage toolId="slugify">
      <Slugifier />
    </ToolPage>
  );
}
