import { toolMetadata } from '@/lib/seo';
import JwtDecoder from '@/components/JwtDecoder';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('jwt');

export default function JwtPage() {
  return (
    <ToolPage toolId="jwt">
      <JwtDecoder />
    </ToolPage>
  );
}
