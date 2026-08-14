import { Heading, Page, Stack, Text } from '@toolkit/ui';
import { ToolCatalog } from '@/components/catalog/ToolCatalog';
import { JsonLd } from '@/components/seo/JsonLd';
import { websiteLd, organizationLd } from '@/lib/structured-data';

export default function HomePage() {
  return (
    <Page wide>
      <JsonLd data={[websiteLd(), organizationLd()]} />
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
