import type { AxeSummary } from './axe.js';
import type { KeyboardAudit } from './keyboard.js';
import type { RiskSummary } from './risk.js';
import type { JourneySummary } from './journey.js';

export type Assessment = 'confirmed' | 'likely' | 'review';
export type InteractionQuestion = 'reach' | 'see' | 'operate' | 'leave';

export type Finding = {
  id: string;
  source: 'axe' | 'interaction' | 'journey';
  assessment: Assessment;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  title: string;
  observed: string;
  whyItMatters: string;
  inspect: string[];
  suggestedFixes: string[];
  manualVerification: string[];
  relatedCriteria: string[];
  potentialFrameworks: string[];
  helpUrl: string;
  evidence: Array<{ target: string[]; html: string; summary: string }>;
  interactionQuestions?: InteractionQuestion[];
};

export type StabilitySummary = {
  status: 'stable' | 'intermittent' | 'single-run';
  repeats: number;
  searchTabIndexes: Array<number | null>;
  classifications: string[];
  explanation: string;
};

const criterionFromTag = (tag: string) => {
  const match = tag.match(/^wcag(\d)(\d)(\d)$/i);
  return match ? `WCAG ${match[1]}.${match[2]}.${match[3]}` : null;
};

function frameworksFor(tags: string[]) {
  const wcag20 = tags.includes('wcag2a') || tags.includes('wcag2aa');
  return ['WCAG', 'ADA', 'EAA', ...(wcag20 ? ['Section 508', 'AODA'] : [])];
}

export function analyzeStability(
  audits: Array<KeyboardAudit & { repeat: number }>,
): StabilitySummary {
  const indexes = audits.map(({ searchTabIndex }) => searchTabIndex);
  const classifications = audits.map(({ classification }) => classification);
  if (audits.length < 2)
    return {
      status: 'single-run',
      repeats: audits.length,
      searchTabIndexes: indexes,
      classifications,
      explanation:
        'Only one run was captured; repeat the audit before treating intermittent behavior as stable.',
    };
  const stable = new Set(indexes.map(String)).size === 1 && new Set(classifications).size === 1;
  return {
    status: stable ? 'stable' : 'intermittent',
    repeats: audits.length,
    searchTabIndexes: indexes,
    classifications,
    explanation: stable
      ? 'The search position and keyboard classification matched across repeated clean runs.'
      : 'The search position or keyboard classification changed between clean runs.',
  };
}

export function buildFindings(args: {
  axe: AxeSummary | null;
  risks: RiskSummary | null;
  audits: Array<KeyboardAudit & { repeat: number }>;
  queryPossibleTrap: boolean;
  journey: JourneySummary | null;
  stability: StabilitySummary;
}): Finding[] {
  const findings: Finding[] = [];

  for (const violation of args.axe?.violations ?? []) {
    const criteria = violation.tags
      .map(criterionFromTag)
      .filter((value): value is string => Boolean(value));
    findings.push({
      id: `axe:${violation.id}`,
      source: 'axe',
      assessment: 'confirmed',
      impact: (violation.impact as Finding['impact']) ?? 'moderate',
      title: violation.help,
      observed: `${violation.nodes.length} rendered element${violation.nodes.length === 1 ? '' : 's'} failed the automated ${violation.id} rule.`,
      whyItMatters: violation.description,
      inspect: [
        'Review each affected selector and its accessible name, semantics, state and relationships.',
        'Confirm that dynamic states expose the same information to assistive technology.',
      ],
      suggestedFixes: [
        'Use native semantic HTML where possible.',
        'Apply the rule-specific correction described in the evidence and linked guidance.',
      ],
      manualVerification: [
        'Retest the affected component with keyboard and a screen reader after remediation.',
      ],
      relatedCriteria: [...new Set(criteria)],
      potentialFrameworks: frameworksFor(violation.tags),
      helpUrl: violation.helpUrl,
      evidence: violation.nodes.map((node) => ({
        target: node.target,
        html: node.html,
        summary: node.failureSummary ?? violation.description,
      })),
    });
  }

  for (const risk of args.risks?.findings ?? []) {
    findings.push({
      id: `interaction:${risk.id}`,
      source: 'interaction',
      assessment: risk.assessment,
      impact: risk.impact,
      title: risk.help,
      observed: risk.observed ?? risk.description,
      whyItMatters: risk.whyItMatters ?? risk.description,
      inspect: risk.inspect ?? [],
      suggestedFixes: risk.suggestedFixes ?? [],
      manualVerification: risk.manualVerification ?? [
        'Repeat the interaction manually and confirm the observed behavior.',
      ],
      relatedCriteria:
        risk.relatedCriteria ??
        risk.tags.map(criterionFromTag).filter((value): value is string => Boolean(value)),
      potentialFrameworks: frameworksFor(risk.tags),
      helpUrl: risk.helpUrl,
      evidence: risk.nodes.map((node) => ({
        target: node.target,
        html: node.html,
        summary: node.failureSummary,
      })),
    });
  }

  const searchIndexes = args.audits
    .map(({ searchTabIndex }) => searchTabIndex)
    .filter((value): value is number => value !== null);
  const maximumSearchTabs = searchIndexes.length ? Math.max(...searchIndexes) : null;
  if (maximumSearchTabs !== null && maximumSearchTabs > 50)
    findings.push({
      id: 'journey:excessive-search-focus-path',
      source: 'journey',
      assessment: 'review',
      impact: 'moderate',
      title: 'Search required an unusually long keyboard focus path',
      observed: `Search was reached after up to ${maximumSearchTabs} sequential Tab presses in this audit.`,
      whyItMatters:
        'A keyboard user may traverse substantial unrelated content before reaching a visually prominent primary control.',
      inspect: [
        'DOM order versus visual order',
        'CSS flex/grid ordering',
        'Duplicated responsive elements',
        'Hidden or off-screen focusable content',
        'Positive tabindex values',
        'Missing bypass mechanisms',
      ],
      suggestedFixes: [
        'Align DOM order with the intended reading and interaction order.',
        'Remove duplicated or hidden controls from the tab sequence.',
        'Provide a working skip mechanism where repeated content cannot be avoided.',
      ],
      manualVerification: [
        'Repeat from a clean session.',
        'Judge whether the sequence preserves meaning and operability; the number alone does not establish failure.',
      ],
      relatedCriteria: ['WCAG 2.4.3', 'WCAG 2.4.1'],
      potentialFrameworks: ['WCAG', 'ADA', 'EAA', 'Section 508', 'AODA'],
      helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html',
      evidence: [],
    });

  const repeatedPrimaryTrap = args.audits.some(
    ({ classification }) => classification === 'possible-trap',
  );
  if (repeatedPrimaryTrap || args.queryPossibleTrap)
    findings.push({
      id: 'journey:possible-keyboard-trap',
      source: 'journey',
      assessment: repeatedPrimaryTrap && args.stability.status === 'stable' ? 'likely' : 'review',
      impact: 'critical',
      title: 'Possible keyboard focus trap observed',
      observed:
        'Repeated Tab and Shift+Tab actions did not reliably move focus away from the detected search interface.',
      whyItMatters:
        'A keyboard user may be unable to continue to the rest of the page without abandoning the interaction.',
      inspect: [
        'Keyboard event handlers that cancel Tab',
        'Focus redirection in autocomplete state',
        'Roving tabindex implementation',
        'Escape dismissal and focus restoration',
      ],
      suggestedFixes: [
        'Allow standard Tab and Shift+Tab movement unless the component documents an alternative.',
        'Use established combobox keyboard patterns and return focus predictably.',
      ],
      manualVerification: [
        'Repeat with the autocomplete both open and closed.',
        'Confirm exit using Tab, Shift+Tab and Escape in multiple browsers.',
      ],
      relatedCriteria: ['WCAG 2.1.2'],
      potentialFrameworks: ['WCAG', 'ADA', 'EAA', 'Section 508', 'AODA'],
      helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html',
      evidence: [],
    });

  for (const journeyFinding of args.journey?.findings ?? []) findings.push(journeyFinding);
  return findings.map((finding) => ({
    ...finding,
    interactionQuestions: finding.interactionQuestions?.length
      ? finding.interactionQuestions
      : inferInteractionQuestions(finding),
  }));
}

function inferInteractionQuestions(finding: Finding): InteractionQuestion[] {
  const text = `${finding.id} ${finding.title} ${finding.relatedCriteria.join(' ')}`.toLowerCase();
  const questions = new Set<InteractionQuestion>();
  if (/focus-visible|focus indicator|obscur|contrast|color|visual/.test(text)) questions.add('see');
  if (/trap|dialog|modal|escape|leave/.test(text)) questions.add('leave');
  if (/focus-order|focus path|skip|tabindex|offscreen|reach|target-size/.test(text))
    questions.add('reach');
  if (
    /keyboard|control|name|label|aria|form|error|input|button|link|image|alt|widget|combobox|tab/.test(
      text,
    )
  )
    questions.add('operate');
  if (!questions.size) questions.add('operate');
  return [...questions];
}
