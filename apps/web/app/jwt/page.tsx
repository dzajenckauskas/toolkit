import { toolMetadata } from '@/lib/seo';
import JwtDecoder from '@/components/tools/developer/JwtDecoder';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('jwt');

export default function JwtPage() {
  return (
    <ToolPage toolId="jwt">
      <JwtDecoder />
    </ToolPage>
  );
}
