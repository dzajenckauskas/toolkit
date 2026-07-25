import type { Metadata } from 'next';
import TotpGenerator from '@/components/TotpGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'TOTP / 2FA Code Generator — Free Tools',
  description:
    'Generate TOTP two-factor codes from a base32 secret in your browser. Nothing is uploaded.',
};

export default function TotpPage() {
  return (
    <ToolPage toolId="totp">
      <TotpGenerator />
    </ToolPage>
  );
}
