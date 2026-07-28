import { toolMetadata } from '@/lib/seo';
import PasswordGenerator from '@/components/PasswordGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('password');

export default function PasswordPage() {
  return (
    <ToolPage toolId="password">
      <PasswordGenerator />
    </ToolPage>
  );
}
