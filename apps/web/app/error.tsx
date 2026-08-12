'use client';

import { useEffect } from 'react';
import { Button, ButtonLink, Heading, Page, Stack, Text } from '@toolkit/ui';

/**
 * App Router error boundary. Catches an uncaught render error in any tool page
 * (its segment's children) and shows a styled recovery screen inside the root
 * layout instead of a blank/default error page. `reset` re-renders the failed
 * segment; the catalog link is the escape hatch.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // No telemetry backend (client-only app); log so it's visible in devtools.
    console.error(error);
  }, [error]);

  return (
    <Page>
      <Stack gap={4} align="flex-start" data-testid="error-boundary">
        <Heading>Something went wrong</Heading>
        <Text tone="muted">
          This tool hit an unexpected error. Nothing you loaded left your browser. You can try
          again, or head back to the catalog.
        </Text>
        <Stack direction="row" gap={2} wrap>
          <Button type="button" variant="primary" onClick={reset} data-testid="error-retry">
            Try again
          </Button>
          <ButtonLink href="/" variant="ghost" data-testid="error-home">
            Back to all tools
          </ButtonLink>
        </Stack>
      </Stack>
    </Page>
  );
}
