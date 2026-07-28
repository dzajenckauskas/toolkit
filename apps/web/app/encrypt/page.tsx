import { toolMetadata } from '@/lib/seo';
import TextEncryptor from '@/components/tools/privacy/TextEncryptor';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('encrypt');

export default function EncryptPage() {
  return (
    <ToolPage toolId="encrypt">
      <TextEncryptor />
    </ToolPage>
  );
}
