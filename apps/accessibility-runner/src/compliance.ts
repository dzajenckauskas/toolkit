import type { AxeSummary } from './axe.js';
import type { RiskSummary } from './risk.js';
import type { Finding } from './findings.js';

export type FrameworkSummary = {
  id: 'wcag' | 'ada' | 'eaa' | 'section-508' | 'aoda';
  name: string;
  baseline: string;
  applicability: string;
  sourceUrl: string;
  mappedFindingIds: string[];
  status: 'issues-detected' | 'manual-review-required';
  disclaimer: string;
};

type FindingReference = { id: string; tags: string[] };

export function buildFrameworkSummary(
  axe: AxeSummary | null,
  risks: RiskSummary | null,
  keyboardTrap: boolean,
  unifiedFindings?: Finding[],
): FrameworkSummary[] {
  const findings: FindingReference[] = unifiedFindings?.length
    ? unifiedFindings.map((finding) => ({
        id: finding.id,
        tags: finding.relatedCriteria
          .map((criterion) => criterion.replace(/\D/g, ''))
          .map((digits) => `wcag${digits}`),
      }))
    : [
        ...(keyboardTrap ? [{ id: 'keyboard-search-trap', tags: ['wcag2a', 'wcag212'] }] : []),
        ...(risks?.findings.map(({ id, tags }) => ({ id, tags })) ?? []),
        ...(axe?.violations.map(({ id, tags }) => ({ id, tags })) ?? []),
      ];
  const all = findings.map(({ id }) => id);
  const wcag = findings
    .filter(({ tags }) => tags.some((tag) => tag.startsWith('wcag')))
    .map(({ id }) => id);
  const wcag20 = unifiedFindings?.length
    ? unifiedFindings
        .filter(
          (finding) =>
            finding.potentialFrameworks.includes('Section 508') ||
            finding.potentialFrameworks.includes('AODA'),
        )
        .map(({ id }) => id)
    : findings
        .filter(({ tags }) => tags.some((tag) => tag === 'wcag2a' || tag === 'wcag2aa'))
        .map(({ id }) => id);
  const make = (
    framework: Omit<FrameworkSummary, 'mappedFindingIds' | 'status' | 'disclaimer'>,
    mappedFindingIds: string[],
  ): FrameworkSummary => ({
    ...framework,
    mappedFindingIds: [...new Set(mappedFindingIds)],
    status: mappedFindingIds.length ? 'issues-detected' : 'manual-review-required',
    disclaimer:
      'Automated mapping supports readiness work; it does not establish legal compliance.',
  });

  return [
    make(
      {
        id: 'wcag',
        name: 'WCAG',
        baseline: 'WCAG 2.2 Level AA',
        applicability: 'Broad technical accessibility target for web content.',
        sourceUrl: 'https://www.w3.org/TR/WCAG22/',
      },
      wcag,
    ),
    make(
      {
        id: 'ada',
        name: 'ADA',
        baseline: 'Title II: WCAG 2.1 AA; Title III: accessibility obligations',
        applicability:
          'US state/local government and businesses open to the public; scope depends on entity and service.',
        sourceUrl: 'https://www.ada.gov/resources/web-guidance/',
      },
      all,
    ),
    make(
      {
        id: 'eaa',
        name: 'EAA',
        baseline: 'Directive (EU) 2019/882 — ecommerce service requirements',
        applicability:
          'Covered EU products and services; includes identification, security, payment and service information.',
        sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019L0882',
      },
      all,
    ),
    make(
      {
        id: 'section-508',
        name: 'Section 508',
        baseline: 'Revised 508 Standards / WCAG 2.0 Level AA',
        applicability: 'US federal agency ICT and covered electronic content.',
        sourceUrl: 'https://www.section508.gov/test/websites/',
      },
      wcag20,
    ),
    make(
      {
        id: 'aoda',
        name: 'AODA',
        baseline: 'WCAG 2.0 Level AA, with specified media exceptions',
        applicability:
          'Covered Ontario public-sector organizations and qualifying businesses/non-profits.',
        sourceUrl: 'https://www.ontario.ca/page/how-make-websites-accessible',
      },
      wcag20,
    ),
  ];
}
