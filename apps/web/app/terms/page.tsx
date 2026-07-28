import { Heading, Page, Stack, Text } from '@toolkit/ui';
import { Prose } from '@/components/LegalDoc';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Terms & Conditions',
  description:
    'The terms that govern your use of toolkit — a free collection of tools that run entirely in your browser.',
  path: '/terms',
});

const LAST_UPDATED = '24 July 2026';

export default function TermsPage() {
  return (
    <Page>
      <Stack gap={5}>
        <header>
          <Heading>Terms &amp; Conditions</Heading>
          <Text tone="subtle" size="sm">
            Last updated {LAST_UPDATED}
          </Text>
        </header>

        <Prose>
          <p>
            These Terms &amp; Conditions (the “Terms”) govern your use of toolkit (the “Service”), a
            free collection of small utilities that run entirely in your web browser. By using the
            Service you agree to these Terms. If you do not agree, please do not use the Service.
          </p>

          <h2>1. The service</h2>
          <p>
            toolkit provides browser-based tools for working with images, text, data and other
            files. <strong>All processing happens locally on your device.</strong> The Service has
            no user accounts and no backend that receives your content: the files and text you work
            with are not uploaded to, transmitted to, or stored on any server operated by us.
          </p>

          <h2>2. No charge</h2>
          <p>
            The Service is provided free of charge, with no account, sign-up or payment required. It
            is offered as a personal project and may be changed, limited, suspended or discontinued
            at any time without notice.
          </p>

          <h2>3. Your content and responsibilities</h2>
          <p>
            You retain all rights to the files, text and other content you process with the Service,
            and to the output you produce. You are solely responsible for that content and for
            ensuring you have the right to use it. You agree not to use the Service:
          </p>
          <ul>
            <li>for any unlawful purpose or in violation of any applicable law or regulation;</li>
            <li>
              to process content you do not have the right to process, or that infringes the rights
              of others;
            </li>
            <li>
              in any way that could damage, disable or impair the Service, or attempt to gain
              unauthorised access to it.
            </li>
          </ul>

          <h2>4. Local storage</h2>
          <p>
            Some tools save small amounts of data in your browser’s local storage to remember your
            preferences or work in progress (for example your light/dark theme choice, or notes and
            cards you create). This data stays on your device, is never transmitted to us, and can
            be removed by clearing your browser’s site data.
          </p>

          <h2>5. No warranty</h2>
          <p>
            The Service is provided <strong>“as is” and “as available”</strong>, without warranties
            of any kind, whether express or implied, including but not limited to fitness for a
            particular purpose, accuracy, reliability, or non-infringement. We do not warrant that
            the Service will be uninterrupted, error-free, or that any output will meet your
            requirements. You use the Service, and rely on any output, at your own risk. Always keep
            backups of important files.
          </p>

          <h2>6. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, the author of the Service shall not be liable
            for any indirect, incidental, special, consequential or punitive damages, or any loss of
            data, profits or goodwill, arising out of or in connection with your use of, or
            inability to use, the Service — even if advised of the possibility of such damages.
          </p>

          <h2>7. Third-party and downloadable software</h2>
          <p>
            The Service may rely on open-source libraries provided by third parties under their own
            licences. Output you download (such as generated images, PDFs or files) is yours to use;
            you are responsible for how you use it.
          </p>

          <h2>8. Changes to these terms</h2>
          <p>
            These Terms may be updated from time to time. Changes take effect when the updated
            version is published on this page, and the “last updated” date above will reflect the
            most recent revision. Continued use of the Service after changes are published
            constitutes acceptance of the revised Terms.
          </p>

          <h2>9. Contact</h2>
          <p>
            Questions about these Terms can be sent to <a href={CONTACT_MAILTO}>{CONTACT_EMAIL}</a>.
          </p>
        </Prose>
      </Stack>
    </Page>
  );
}
