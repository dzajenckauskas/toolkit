import { toolMetadata } from '@/lib/seo';
import JwtTool from '@/components/tools/developer/JwtTool';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('jwt');

export default function JwtPage() {
  return (
    <ToolPage toolId="jwt">
      <JwtTool />
    </ToolPage>
  );
}
