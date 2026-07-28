import { toolMetadata } from '@/lib/seo';
import PasswordGenerator from '@/components/tools/developer/PasswordGenerator';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('password');

export default function PasswordPage() {
  return (
    <ToolPage toolId="password">
      <PasswordGenerator />
    </ToolPage>
  );
}
