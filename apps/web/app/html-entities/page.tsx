import { toolMetadata } from '@/lib/seo';
import HtmlEntitiesTool from '@/components/HtmlEntitiesTool';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('html-entities');

export default function HtmlEntitiesPage() {
  return (
    <ToolPage toolId="html-entities">
      <HtmlEntitiesTool />
    </ToolPage>
  );
}
