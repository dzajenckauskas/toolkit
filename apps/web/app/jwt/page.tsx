import type { Metadata } from 'next';
import JwtDecoder from '@/components/JwtDecoder';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'JWT Decoder — Free Tools',
  description: 'Decode and inspect JSON Web Tokens in your browser. Nothing leaves your device.',
};

export default function JwtPage() {
  return (
    <ToolPage toolId="jwt">
      <JwtDecoder />
    </ToolPage>
  );
}
