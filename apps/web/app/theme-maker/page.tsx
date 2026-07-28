import { toolMetadata } from '@/lib/seo';
import ThemeMaker from '@/components/tools/design/ThemeMaker';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('theme-maker');

export default function ThemeMakerPage() {
  return (
    <ToolPage toolId="theme-maker">
      <ThemeMaker />
    </ToolPage>
  );
}
