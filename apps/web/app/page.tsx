import { Heading, Page, Stack, Text } from '@/components/ui';
import { ToolCatalog } from '@/components/ToolCatalog';

export default function HomePage() {
  return (
    <Page wide>
      <Stack gap={5}>
        <header>
          <Heading>Free tools that run in your browser</Heading>
          <Text tone="muted">
            No account, no upload, no paywall — every tool runs locally on your device. Search, or
            browse by category below.
          </Text>
        </header>
        <ToolCatalog />
      </Stack>
    </Page>
  );
}
