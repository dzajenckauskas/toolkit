import type { Metadata } from 'next';
import TextEncryptor from '@/components/TextEncryptor';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Text Encrypt / Decrypt (AES) — Free Tools',
  description:
    'Encrypt and decrypt text with a password (AES-256-GCM) in your browser. Nothing is uploaded.',
};

export default function EncryptPage() {
  return (
    <ToolPage toolId="encrypt">
      <TextEncryptor />
    </ToolPage>
  );
}
