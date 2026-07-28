import { toolMetadata } from '@/lib/seo';
import UrlEncoder from '@/components/tools/developer/UrlEncoder';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('url-encode');

export default function UrlEncodePage() {
  return (
    <ToolPage toolId="url-encode">
      <UrlEncoder />
    </ToolPage>
  );
}
