import { toolMetadata } from '@/lib/seo';
import ThemeMaker from '@/components/ThemeMaker';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('theme-maker');

export default function ThemeMakerPage() {
  return (
    <ToolPage toolId="theme-maker">
      <ThemeMaker />
    </ToolPage>
  );
}
