import type { Metadata } from 'next';
import UrlEncoder from '@/components/UrlEncoder';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'URL Encode / Decode — Free Tools',
  description: 'Percent-encode and decode URL components in your browser. No account, no upload.',
};

export default function UrlEncodePage() {
  return (
    <ToolPage toolId="url-encode">
      <UrlEncoder />
    </ToolPage>
  );
}
