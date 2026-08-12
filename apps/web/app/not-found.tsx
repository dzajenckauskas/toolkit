import type { Metadata } from 'next';
import { ButtonLink, Heading, Page, Stack, Text } from '@toolkit/ui';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

/**
 * App Router 404. Renders inside the root layout (header + footer), styled with
 * the design-system primitives, and points back to the catalog — no more bare
 * default Next.js 404 for an unknown or renamed tool route.
 */
export default function NotFound() {
  return (
    <Page>
      <Stack gap={4} align="flex-start" data-testid="not-found">
        <Text tone="muted" size="sm" numeric>
          404
        </Text>
        <Heading>This page doesn’t exist</Heading>
        <Text tone="muted">
          The tool or page you’re looking for may have been renamed or moved. Everything lives on
          the catalog — pick a tool from there.
        </Text>
        <ButtonLink href="/" variant="primary" data-testid="not-found-home">
          Back to all tools
        </ButtonLink>
      </Stack>
    </Page>
  );
}
