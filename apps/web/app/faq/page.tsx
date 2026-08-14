import { Faq } from '@/components/catalog/Faq';
import { Heading, Page, Stack, Text } from '@toolkit/ui';
import { Breadcrumb } from '@/components/catalog/Breadcrumb';
import { pageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqPageLd } from '@/lib/structured-data';
import { SITE_FAQS } from '@/data/site-faqs';

export const metadata = pageMetadata({
  title: 'FAQ – Free, Private, In-Browser Tools',
  description:
    'Answers to common questions about Toolkit — is it free, does anything get uploaded, plus privacy, offline use and browser support for the in-browser tools.',
  path: '/faq',
});

export default function FaqPage() {
  return (
    <Page wide style={{ paddingTop: '1rem' }}>
      <Breadcrumb trail={[{ label: 'FAQ' }]} />
      <JsonLd data={faqPageLd(SITE_FAQS)} />
      <Stack gap={5}>
        <header>
          <Heading>Frequently asked questions</Heading>
          <Text tone="muted">
            Everything runs in your browser — free, private, and with no account. Here are the
            details.
          </Text>
        </header>
        <Faq />
      </Stack>
    </Page>
  );
}
