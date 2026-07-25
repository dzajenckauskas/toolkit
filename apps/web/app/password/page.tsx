import type { Metadata } from 'next';
import PasswordGenerator from '@/components/PasswordGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Password Generator — Free Tools',
  description:
    'Generate strong random passwords in your browser. Cryptographically random, no upload.',
};

export default function PasswordPage() {
  return (
    <ToolPage toolId="password">
      <PasswordGenerator />
    </ToolPage>
  );
}
