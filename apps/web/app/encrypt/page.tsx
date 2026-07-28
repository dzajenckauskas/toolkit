import { toolMetadata } from '@/lib/seo';
import TextEncryptor from '@/components/TextEncryptor';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('encrypt');

export default function EncryptPage() {
  return (
    <ToolPage toolId="encrypt">
      <TextEncryptor />
    </ToolPage>
  );
}
