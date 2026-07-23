import { ButtonLink, Heading, Page, Stack, Text } from '@/components/ui';

export default function HomePage() {
  return (
    <Page>
      <Stack gap={4}>
        <header>
          <Heading>Ecommerce Toolkit</Heading>
          <Text tone="muted">Prepare product images quickly, right in your browser.</Text>
        </header>
        <Stack direction="row" gap={2} wrap>
          <ButtonLink href="/optimize" variant="primary">
            Open the Image Optimizer
          </ButtonLink>
          <ButtonLink href="/crop" variant="ghost">
            Open the Image Cropper
          </ButtonLink>
        </Stack>
      </Stack>
    </Page>
  );
}
