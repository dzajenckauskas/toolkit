import { Heading, Page, Stack, Text } from '@toolkit/ui';
import { ToolCatalog } from '@/components/catalog/ToolCatalog';

export default function HomePage() {
  return (
    <Page wide>
      <Stack gap={5}>
        <header>
          <Heading>Free tools that run in your browser</Heading>
          <Text tone="muted">
            No account, no paywall — nearly every tool runs locally on your device, and the rare
            server-assisted tool is clearly labelled. Search, or browse by category below.
          </Text>
        </header>
        <ToolCatalog />
      </Stack>
    </Page>
  );
}
