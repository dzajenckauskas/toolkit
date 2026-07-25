import type { Metadata } from 'next';
import HtmlEntitiesTool from '@/components/HtmlEntitiesTool';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'HTML Entity Encode / Decode — Free Tools',
  description: 'Escape and unescape HTML entities in your browser. No account, no upload.',
};

export default function HtmlEntitiesPage() {
  return (
    <ToolPage toolId="html-entities">
      <HtmlEntitiesTool />
    </ToolPage>
  );
}
