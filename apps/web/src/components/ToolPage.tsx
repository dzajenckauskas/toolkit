'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { Heading } from '@/components/ui';
import { CategoryIcon } from '@/components/CategoryIcon';
import { FaqAccordion } from '@/components/FaqAccordion';
import { TOOLS, type Tool } from '@/tools/registry';
import { getToolContent } from '@/tools/content';

/**
 * Shared landing-page shell for every tool. Wraps the tool's interactive
 * component in a hero, then adds a "how it works" walkthrough, highlight cards,
 * an FAQ and a related-tools band — all driven by the registry entry and
 * {@link getToolContent}, so a page is just `<ToolPage toolId="…"><Tool/></ToolPage>`.
 */

const Main = styled('main')({});

// Centred column shared by the light sections.
const Shell = styled('div')({
  maxWidth: 1080,
  margin: '0 auto',
  padding: '0 1.25rem',
});

const Hero = styled('section')(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  paddingTop: theme.space(10),
  paddingBottom: theme.space(10),
  // Soft accent glow behind the hero, echoing the reference's lit dropzone.
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-30%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(760px, 92%)',
    height: '70%',
    background: `radial-gradient(60% 60% at 50% 50%, color-mix(in srgb, ${theme.color.accent} 22%, transparent), transparent 70%)`,
    pointerEvents: 'none',
    zIndex: 0,
  },
}));

const HeroInner = styled('div')({
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
});

const Eyebrow = styled(Link)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.space(2),
  padding: '0.3rem 0.8rem',
  marginBottom: theme.space(4),
  fontSize: '0.8rem',
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: theme.color.accentStrong,
  textDecoration: 'none',
  background: `color-mix(in srgb, ${theme.color.accent} 12%, transparent)`,
  border: `1px solid color-mix(in srgb, ${theme.color.accent} 30%, transparent)`,
  borderRadius: theme.radius.pill,
  '& svg': { color: 'currentColor' },
  '&:hover': { background: `color-mix(in srgb, ${theme.color.accent} 18%, transparent)` },
}));

const Tagline = styled('p')(({ theme }) => ({
  margin: `${theme.space(3)} auto 0`,
  maxWidth: 640,
  fontSize: '1.15rem',
  lineHeight: 1.5,
  color: theme.color.muted,
}));

const Workspace = styled('div')(({ theme }) => ({
  marginTop: theme.space(8),
  textAlign: 'left',
  padding: theme.space(4),
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow,
  '@media (min-width: 640px)': { padding: theme.space(6) },
}));

// Generic section scaffolding.
const Section = styled('section')(({ theme }) => ({
  paddingTop: theme.space(10),
  paddingBottom: theme.space(10),
}));

const SectionTitle = styled('h2')(({ theme }) => ({
  margin: 0,
  textAlign: 'center',
  fontSize: 'clamp(1.4rem, 3vw, 2rem)',
  fontWeight: 900,
  letterSpacing: '-0.03em',
  color: theme.color.text,
}));

const SectionLead = styled('p')(({ theme }) => ({
  margin: `${theme.space(2)} auto 0`,
  maxWidth: 640,
  textAlign: 'center',
  color: theme.color.muted,
}));

const Grid3 = styled('div')(({ theme }) => ({
  marginTop: theme.space(8),
  display: 'grid',
  gap: theme.space(4),
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
}));

const StepCard = styled('div')(({ theme }) => ({
  padding: theme.space(5),
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.lg,
}));

const StepNumber = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.1rem',
  height: '2.1rem',
  marginBottom: theme.space(3),
  fontSize: '0.95rem',
  fontWeight: 800,
  color: theme.color.accentContrast,
  background: theme.color.accent,
  borderRadius: theme.radius.pill,
}));

const CardTitle = styled('h3')(({ theme }) => ({
  margin: `0 0 ${theme.space(2)}`,
  fontSize: '1.05rem',
  fontWeight: 700,
  color: theme.color.text,
}));

const CardBody = styled('p')(({ theme }) => ({
  margin: 0,
  color: theme.color.muted,
  lineHeight: 1.6,
}));

const HighlightCard = styled('div')(({ theme }) => ({
  padding: theme.space(5),
  background: theme.color.surface2,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.lg,
}));

const FaqWrap = styled('div')(({ theme }) => ({
  marginTop: theme.space(8),
  maxWidth: 760,
  marginInline: 'auto',
}));

// Dark "explore more" band, mirroring the reference's footer grid.
const RelatedBand = styled('section')({
  background: '#191a1c',
  color: '#f2f0ec',
  padding: '4rem 0',
});

const RelatedTitle = styled('h2')({
  margin: 0,
  fontSize: 'clamp(1.4rem, 3vw, 2rem)',
  fontWeight: 900,
  letterSpacing: '-0.03em',
  color: '#f2f0ec',
});

const RelatedGrid = styled('div')(({ theme }) => ({
  marginTop: theme.space(7),
  display: 'grid',
  gap: theme.space(4),
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
}));

const RelatedCard = styled(Link)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space(1),
  padding: theme.space(4),
  color: 'inherit',
  textDecoration: 'none',
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.radius.md,
  transition: 'border-color 0.12s ease, background 0.12s ease',
  '&:hover': {
    borderColor: 'rgba(255, 255, 255, 0.28)',
    background: 'rgba(255, 255, 255, 0.07)',
  },
  '& svg': { color: '#93bcb5' },
}));

const RelatedName = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontWeight: 700,
});

const RelatedDesc = styled('div')({
  fontSize: '0.85rem',
  color: 'rgba(242, 240, 236, 0.66)',
  lineHeight: 1.5,
});

function relatedTools(tool: Tool): Tool[] {
  const sameCategory = TOOLS.filter(
    (t) => t.category === tool.category && t.id !== tool.id && t.status === 'live',
  );
  if (sameCategory.length >= 4) return sameCategory.slice(0, 8);
  // Top up from other live tools so the band never looks sparse.
  const others = TOOLS.filter(
    (t) => t.status === 'live' && t.id !== tool.id && t.category !== tool.category,
  );
  return [...sameCategory, ...others].slice(0, 8);
}

export function ToolPage({ toolId, children }: { toolId: string; children: React.ReactNode }) {
  const tool = TOOLS.find((t) => t.id === toolId);

  // Defensive: an unknown id still renders the tool, just without the shell.
  if (!tool) {
    return (
      <Main>
        <Shell style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>{children}</Shell>
      </Main>
    );
  }

  const content = getToolContent(tool);
  const related = relatedTools(tool);

  return (
    <Main>
      <Hero>
        <Shell>
          <HeroInner>
            <Eyebrow href={`/#cat-${tool.category}`}>
              <CategoryIcon category={tool.category} />
              {tool.category}
            </Eyebrow>
            <Heading id="tool-heading">{tool.name}</Heading>
            <Tagline>{content.tagline}</Tagline>
            <Workspace>{children}</Workspace>
          </HeroInner>
        </Shell>
      </Hero>

      <Section>
        <Shell>
          <SectionTitle>How it works</SectionTitle>
          <SectionLead>Three simple steps — all in your browser.</SectionLead>
          <Grid3>
            {content.steps.map((step, i) => (
              <StepCard key={i}>
                <StepNumber>{i + 1}</StepNumber>
                <CardTitle>{step.title}</CardTitle>
                <CardBody>{step.body}</CardBody>
              </StepCard>
            ))}
          </Grid3>
        </Shell>
      </Section>

      <Section>
        <Shell>
          <SectionTitle>Why use {tool.name}</SectionTitle>
          <Grid3>
            {content.highlights.map((h, i) => (
              <HighlightCard key={i}>
                <CardTitle>{h.title}</CardTitle>
                <CardBody>{h.body}</CardBody>
              </HighlightCard>
            ))}
          </Grid3>
        </Shell>
      </Section>

      <Section>
        <Shell>
          <SectionTitle>Frequent questions</SectionTitle>
          <FaqWrap>
            <FaqAccordion items={content.faqs.map((f) => ({ q: f.q, a: f.a }))} />
          </FaqWrap>
        </Shell>
      </Section>

      <RelatedBand>
        <Shell>
          <RelatedTitle>Explore more tools</RelatedTitle>
          <RelatedGrid>
            {related.map((t) => (
              <RelatedCard key={t.id} href={t.href} data-testid={`related-${t.id}`}>
                <RelatedName>
                  <CategoryIcon category={t.category} />
                  {t.name}
                </RelatedName>
                <RelatedDesc>{t.description}</RelatedDesc>
              </RelatedCard>
            ))}
          </RelatedGrid>
        </Shell>
      </RelatedBand>
    </Main>
  );
}
