import { toolMetadata } from '@/lib/seo';
import UrlEncoder from '@/components/UrlEncoder';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('url-encode');

export default function UrlEncodePage() {
  return (
    <ToolPage toolId="url-encode">
      <UrlEncoder />
    </ToolPage>
  );
}
