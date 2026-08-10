'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import Image from 'next/image';
import { Button } from '@toolkit/ui';

type Evidence = {
  target?: string[];
  summary?: string;
  failureSummary?: string;
  html?: string;
};

type Finding = {
  id?: string;
  title?: string;
  help?: string;
  description?: string;
  observed?: string;
  whyItMatters?: string;
  impact?: string;
  assessment?: 'confirmed' | 'likely' | 'review';
  confidence?: string;
  evidence?: Evidence[];
  nodes?: Evidence[];
  inspect?: string[];
  suggestedFixes?: string[];
  manualVerification?: string[];
  relatedCriteria?: string[];
  helpUrl?: string;
};

type Framework = {
  name: string;
  baseline: string;
  applicability: string;
  sourceUrl: string;
  status: string;
  mappedFindingIds: string[];
};

type AuditReport = {
  title?: string;
  url: string;
  startedAt?: string;
  finishedAt?: string;
  overall?: string;
  findings?: Finding[];
  axe?: { violations?: Finding[] };
  risks?: { findings?: Finding[] };
  frameworks?: Framework[];
  journey?: {
    caution?: string;
    stages?: Array<{ id?: string; label: string; status: string; detail: string }>;
  };
  stability?: { status: string; repeats: number };
};

type AuditJob = {
  id: string;
  status: 'queued' | 'running' | 'complete' | 'failed';
  queuePosition?: number | null;
  logs: string[];
  report: AuditReport | null;
  artifacts: string[];
  error: string | null;
};

const Form = styled('form')(({ theme }) => ({ display: 'grid', gap: theme.space(4) }));
const AuditButton = styled(Button)({
  paddingTop: '0.6rem',
  paddingBottom: '0.8rem',
});
const UrlRow = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.space(3),
  '@media (max-width: 680px)': { gridTemplateColumns: '1fr' },
}));
const Label = styled('label')(({ theme }) => ({
  display: 'grid',
  gap: theme.space(2),
  color: theme.color.muted,
  fontSize: '0.78rem',
  fontWeight: 700,
}));
const Options = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.space(4),
  '@media (max-width: 580px)': { gridTemplateColumns: '1fr' },
}));
const Notice = styled('div')(({ theme }) => ({
  padding: theme.space(3),
  display: 'flex',
  gap: theme.space(2),
  alignItems: 'flex-start',
  color: theme.color.muted,
  background: theme.color.surface2,
  borderRadius: theme.radius.md,
  fontSize: '0.8rem',
  lineHeight: 1.5,
}));
const Dot = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  marginTop: '0.35rem',
  flex: '0 0 auto',
  borderRadius: '50%',
  background: theme.color.accent,
}));
const ErrorText = styled('p')(({ theme }) => ({
  margin: 0,
  color: theme.color.dangerText,
  fontWeight: 700,
}));
const Progress = styled('section')(({ theme }) => ({
  marginTop: theme.space(5),
  padding: theme.space(5),
  color: '#f2f0ec',
  background: '#191a1c',
  borderRadius: theme.radius.lg,
}));
const ProgressBar = styled('div')(({ theme }) => ({
  height: 4,
  marginTop: theme.space(4),
  overflow: 'hidden',
  background: 'rgba(255,255,255,.16)',
  '&::after': {
    content: '""',
    display: 'block',
    width: '38%',
    height: '100%',
    background: '#b6d6d0',
    animation: 'audit-progress 2s ease-in-out infinite',
  },
  '@keyframes audit-progress': {
    from: { transform: 'translateX(-100%)' },
    to: { transform: 'translateX(365%)' },
  },
}));
const Log = styled('pre')({
  maxHeight: 220,
  overflow: 'auto',
  whiteSpace: 'pre-wrap',
  fontSize: '0.72rem',
  lineHeight: 1.55,
  color: '#cbd5cf',
});
const Section = styled('section')(({ theme }) => ({ marginTop: theme.space(7) }));
const SectionHead = styled('div')(({ theme }) => ({
  marginBottom: theme.space(4),
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: theme.space(3),
}));
const Title = styled('h2')(({ theme }) => ({
  margin: 0,
  color: theme.color.text,
  fontSize: '1.45rem',
  fontWeight: 900,
  letterSpacing: '-.03em',
}));
const Muted = styled('p')(({ theme }) => ({
  margin: 0,
  color: theme.color.muted,
  lineHeight: 1.55,
}));
const Actions = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.space(2),
}));
const SummaryGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  overflow: 'hidden',
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.lg,
  '@media (max-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  '@media (max-width: 440px)': { gridTemplateColumns: '1fr' },
}));
const SummaryCard = styled('article')<{ primary?: boolean }>(({ theme, primary }) => ({
  minHeight: 130,
  padding: theme.space(4),
  color: primary ? '#f2f0ec' : theme.color.text,
  background: primary ? '#191a1c' : theme.color.surface,
  borderRight: `1px solid ${theme.color.border}`,
  '& span': {
    display: 'block',
    color: primary ? '#aab5ae' : theme.color.muted,
    fontSize: '0.68rem',
    fontWeight: 800,
    letterSpacing: '.08em',
    textTransform: 'uppercase',
  },
  '& strong': {
    display: 'block',
    margin: `${theme.space(4)} 0 ${theme.space(1)}`,
    color: primary ? '#b6d6d0' : theme.color.text,
    fontSize: '1.75rem',
    fontWeight: 900,
    lineHeight: 1,
  },
  '& small': { color: primary ? '#aab5ae' : theme.color.muted, lineHeight: 1.35 },
}));
const AssessmentGrid = styled('div')(({ theme }) => ({
  marginTop: theme.space(3),
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  overflow: 'hidden',
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.lg,
  '@media (max-width: 580px)': { gridTemplateColumns: '1fr' },
}));
const AssessmentTile = styled('div')<{ tone: 'confirmed' | 'likely' | 'review' }>(
  ({ theme, tone }) => ({
    padding: theme.space(4),
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: theme.space(3),
    background: theme.color.surface2,
    borderTop: `3px solid ${tone === 'confirmed' ? '#b34155' : tone === 'likely' ? '#c49431' : '#7b8991'}`,
    '& strong': { fontSize: '1.65rem', fontWeight: 900 },
    '& span': { display: 'block', fontSize: '.7rem', fontWeight: 900, textTransform: 'uppercase' },
    '& small': {
      display: 'block',
      marginTop: theme.space(1),
      color: theme.color.muted,
      lineHeight: 1.35,
    },
  }),
);
const FilterButton = styled('button')<{ active: boolean }>(({ theme, active }) => ({
  minHeight: 34,
  padding: `0 ${theme.space(3)}`,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${active ? theme.color.accent : theme.color.border}`,
  borderRadius: theme.radius.pill,
  color: active ? theme.color.accentContrast : theme.color.text,
  background: active ? theme.color.accent : 'transparent',
  font: 'inherit',
  fontSize: '.75rem',
  fontWeight: 700,
  textTransform: 'capitalize',
  cursor: 'pointer',
}));
const FindingCard = styled('details')(({ theme }) => ({
  borderTop: `1px solid ${theme.color.border}`,
  '& summary': {
    padding: `${theme.space(4)} 0`,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: theme.space(3),
    alignItems: 'center',
    cursor: 'pointer',
    listStyle: 'none',
  },
  '& summary::-webkit-details-marker': { display: 'none' },
  '@media (max-width: 580px)': {
    '& summary': { gridTemplateColumns: 'auto 1fr' },
    '& summary small': { gridColumn: 2 },
  },
}));
const Chip = styled('span')<{ tone: 'confirmed' | 'likely' | 'review' }>(({ theme, tone }) => ({
  minHeight: 24,
  padding: `0 ${theme.space(2)}`,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.radius.pill,
  fontSize: '.62rem',
  fontWeight: 900,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  color: tone === 'confirmed' ? '#912f41' : tone === 'likely' ? '#72510c' : '#4f5e68',
  background: tone === 'confirmed' ? '#f8d9de' : tone === 'likely' ? '#fff0c9' : '#e8edf0',
}));
const FindingBody = styled('div')(({ theme }) => ({
  padding: `0 0 ${theme.space(5)} 3.7rem`,
  color: theme.color.muted,
  lineHeight: 1.55,
  '& strong': { color: theme.color.text },
  '@media (max-width: 580px)': { paddingLeft: 0 },
}));
const Guidance = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.space(3),
  '@media (max-width: 620px)': { gridTemplateColumns: '1fr' },
}));
const GuidanceCard = styled('div')(({ theme }) => ({
  padding: theme.space(3),
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface2,
  '& h3': {
    margin: `0 0 ${theme.space(2)}`,
    color: theme.color.text,
    fontSize: '.75rem',
    textTransform: 'uppercase',
  },
  '& ul': { margin: 0, paddingLeft: '1.1rem' },
}));
const Code = styled('code')(({ theme }) => ({
  display: 'block',
  marginTop: theme.space(2),
  padding: theme.space(3),
  overflowWrap: 'anywhere',
  color: theme.color.text,
  background: theme.color.surface2,
  borderRadius: theme.radius.md,
  fontSize: '.72rem',
}));
const FrameworkGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
  gap: theme.space(3),
}));
const FrameworkCard = styled('article')(({ theme }) => ({
  padding: theme.space(4),
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.lg,
  background: theme.color.surface,
  '& h3': { margin: `0 0 ${theme.space(2)}`, fontSize: '1.15rem', fontWeight: 900 },
  '& p': { color: theme.color.muted, fontSize: '.76rem', lineHeight: 1.45 },
  '& a': {
    marginTop: 'auto',
    color: theme.color.accentStrong,
    fontWeight: 700,
    fontSize: '.75rem',
  },
}));
const JourneyGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
  gap: theme.space(3),
}));
const JourneyCard = styled('article')(({ theme }) => ({
  padding: theme.space(4),
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.lg,
  background: theme.color.surface2,
  '& span': { fontSize: '.62rem', fontWeight: 900, textTransform: 'uppercase' },
  '& h3': { margin: `${theme.space(3)} 0 ${theme.space(2)}`, fontSize: '.9rem' },
  '& p': { margin: 0, color: theme.color.muted, fontSize: '.75rem', lineHeight: 1.45 },
}));
const EvidenceGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
  gap: theme.space(3),
  '& figure': { margin: 0 },
  '& figcaption': {
    marginTop: theme.space(2),
    color: theme.color.muted,
    fontSize: '.72rem',
    overflowWrap: 'anywhere',
  },
}));
const ImageButton = styled('button')({
  width: '100%',
  padding: 0,
  border: 0,
  background: 'transparent',
  cursor: 'zoom-in',
});
const EvidenceImage = styled(Image)(({ theme }) => ({
  width: '100%',
  height: 'auto',
  display: 'block',
  aspectRatio: '16/10',
  objectFit: 'cover',
  borderRadius: theme.radius.md,
}));
const CompareGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.space(4),
  '@media (max-width: 620px)': { gridTemplateColumns: '1fr' },
}));
const RegressionPanel = styled('section')(({ theme }) => ({
  marginTop: theme.space(7),
  padding: theme.space(5),
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.lg,
  background: theme.color.surface2,
  '@media (max-width: 580px)': { padding: theme.space(4) },
}));
const RegressionHeader = styled('div')(({ theme }) => ({
  marginBottom: theme.space(4),
  display: 'grid',
  gap: theme.space(1),
}));
const UploadCard = styled('div')(({ theme }) => ({
  minHeight: 190,
  padding: theme.space(4),
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface,
}));
const UploadCardHead = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: theme.space(3),
  alignItems: 'start',
}));
const StepBadge = styled('span')(({ theme }) => ({
  width: 32,
  height: 32,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  color: theme.color.accentContrast,
  background: theme.color.accent,
  fontFamily: theme.font.mono,
  fontSize: '.68rem',
  fontWeight: 700,
}));
const UploadTitle = styled('h3')(({ theme }) => ({
  margin: 0,
  color: theme.color.text,
  fontSize: '.95rem',
  fontWeight: 900,
}));
const UploadCopy = styled('p')(({ theme }) => ({
  margin: `${theme.space(1)} 0 0`,
  color: theme.color.muted,
  fontSize: '.78rem',
  fontWeight: 300,
  lineHeight: 1.45,
}));
const UploadFooter = styled('div')(({ theme }) => ({
  marginTop: 'auto',
  paddingTop: theme.space(4),
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.space(3),
  alignItems: 'center',
}));
const UploadControl = styled('label')(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  cursor: 'pointer',
  '& input': {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
  '& span': {
    minHeight: 38,
    padding: `0 ${theme.space(4)}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.color.text,
    background: theme.color.surface2,
    border: `1px solid ${theme.color.borderStrong}`,
    borderRadius: theme.radius.pill,
    fontSize: '.8rem',
    fontWeight: 700,
    transition: 'border-color .2s ease, color .2s ease, box-shadow .2s ease',
  },
  '&:hover span': { borderColor: theme.color.accent, color: theme.color.accentStrong },
  '& input:focus-visible + span': {
    outline: 'none',
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
  },
}));
const UploadStatus = styled('span')<{ selected?: boolean }>(({ theme, selected }) => ({
  minWidth: 0,
  flex: '1 1 160px',
  overflow: 'hidden',
  color: selected ? theme.color.text : theme.color.muted,
  fontSize: '.75rem',
  fontWeight: selected ? 600 : 300,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));
const CompareResult = styled('div')(({ theme }) => ({
  marginTop: theme.space(4),
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.space(3),
  '@media (max-width: 580px)': { gridTemplateColumns: '1fr' },
}));
const CompareCard = styled('div')(({ theme }) => ({
  padding: theme.space(4),
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface2,
  '& strong': { display: 'block', fontSize: '1.5rem' },
  '& span': { color: theme.color.muted, fontSize: '.75rem' },
}));
const Dialog = styled('dialog')(({ theme }) => ({
  width: 'min(1100px, calc(100vw - 2rem))',
  maxWidth: 'none',
  padding: 0,
  border: 0,
  borderRadius: theme.radius.lg,
  color: '#f2f0ec',
  background: '#111712',
  '&::backdrop': { background: 'rgba(0,0,0,.78)' },
}));
const DialogHead = styled('div')(({ theme }) => ({
  padding: theme.space(4),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.space(3),
  borderBottom: '1px solid rgba(255,255,255,.14)',
}));
const DialogButton = styled(Button)({
  color: '#f2f0ec',
  background: 'rgba(255,255,255,.04)',
  borderColor: 'rgba(242,240,236,.72)',
  '&:hover': {
    color: '#ffffff',
    background: 'rgba(255,255,255,.12)',
    borderColor: '#ffffff',
  },
  '&:disabled': {
    color: 'rgba(242,240,236,.82)',
    background: 'transparent',
    borderColor: 'rgba(242,240,236,.45)',
    opacity: 0.7,
  },
});
const DialogImage = styled(Image)({
  width: '100%',
  height: 'auto',
  maxHeight: '75vh',
  display: 'block',
  objectFit: 'contain',
  background: '#080b09',
});
const DialogNav = styled('div')(({ theme }) => ({
  padding: theme.space(3),
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.space(3),
  alignItems: 'center',
}));

const assessmentDescriptions = {
  confirmed: 'Directly observed fact or automated rule failure.',
  likely: 'Strong evidence of a barrier; manual confirmation advised.',
  review: 'Observation requires human judgment or exception analysis.',
};

function findingsFor(report: AuditReport): Finding[] {
  return report.findings ?? [...(report.risks?.findings ?? []), ...(report.axe?.violations ?? [])];
}

function progressLabel(job: AuditJob): string {
  if (job.status === 'queued')
    return `Waiting for the audit runner${job.queuePosition ? ` · position ${job.queuePosition}` : ''}…`;
  const text = job.logs.join('\n');
  if (/initial cookie and modal state/.test(text))
    return 'Checking focus before cookie consent is dismissed…';
  if (/ecommerce journey/.test(text)) return 'Reproducing the selected ecommerce journey…';
  if (/interaction risk checks/.test(text))
    return 'Checking focus visibility, obstruction, targets, and custom controls…';
  if (/Running axe/.test(text))
    return 'Checking names, labels, contrast, alternative text, and structure…';
  if (/Query interaction/.test(text)) return 'Testing the search suggestions with a typed query…';
  return 'Following the website’s keyboard focus order…';
}

function riskLabel(report: AuditReport, findings: Finding[]): string {
  const serious = findings.filter((item) =>
    ['critical', 'serious'].includes(item.impact ?? ''),
  ).length;
  if (report.overall === 'possible-trap' || serious > 0) return 'High priority';
  if (findings.length || report.overall === 'inconclusive') return 'Review needed';
  return 'Lower observed risk';
}

function findingKey(finding: Finding): string {
  return finding.id ?? finding.title ?? finding.help ?? JSON.stringify(finding).slice(0, 120);
}

function normalizeAuditUrl(value: string): string {
  const trimmed = value.trim();
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, '')}`;
}

export default function AccessibilityChecker() {
  const [url, setUrl] = useState('');
  const [profile, setProfile] = useState<'safe' | 'full'>('safe');
  const [repeats, setRepeats] = useState(2);
  const [job, setJob] = useState<AuditJob | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'likely' | 'review'>('all');
  const [preview, setPreview] = useState<number | null>(null);
  const [baseline, setBaseline] = useState<AuditReport | null>(null);
  const [newer, setNewer] = useState<AuditReport | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!job || !['queued', 'running'].includes(job.status)) return;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/accessibility-checker/audits/${encodeURIComponent(job.id)}`,
          { cache: 'no-store' },
        );
        const value = (await response.json()) as AuditJob & { error?: string };
        if (!response.ok) throw new Error(value.error || 'Could not read the audit status.');
        setJob(value);
      } catch (pollError) {
        setError(pollError instanceof Error ? pollError.message : String(pollError));
      }
    }, 1_200);
    return () => window.clearTimeout(timer);
  }, [job]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (preview !== null && !dialog.open) dialog.showModal();
    if (preview === null && dialog.open) dialog.close();
  }, [preview]);

  const report = job?.status === 'complete' ? job.report : null;
  const findings = useMemo(() => (report ? findingsFor(report) : []), [report]);
  const visibleFindings = findings.filter(
    (finding) => filter === 'all' || finding.assessment === filter,
  );
  const comparison = useMemo(() => {
    const current = newer ?? report;
    if (!baseline || !current) return null;
    const before = new Map(findingsFor(baseline).map((item) => [findingKey(item), item]));
    const after = new Map(findingsFor(current).map((item) => [findingKey(item), item]));
    return {
      resolved: [...before.keys()].filter((key) => !after.has(key)).length,
      persistent: [...before.keys()].filter((key) => after.has(key)).length,
      added: [...after.keys()].filter((key) => !before.has(key)).length,
    };
  }, [baseline, newer, report]);

  async function startAudit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setJob(null);
    try {
      const normalizedUrl = normalizeAuditUrl(url);
      setUrl(normalizedUrl);
      const response = await fetch('/api/accessibility-checker/audits', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl, profile, repeats }),
      });
      const value = (await response.json()) as AuditJob & { error?: string };
      if (!response.ok) throw new Error(value.error || 'The audit could not start.');
      setJob(value);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : String(startError));
    }
  }

  function downloadReport() {
    if (!report) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
    );
    link.download = `accessibility-${new URL(report.url).hostname}-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function readReport(file: File | undefined, setter: (value: AuditReport | null) => void) {
    if (!file) return setter(null);
    try {
      const value = JSON.parse(await file.text()) as AuditReport;
      if (!value.url || !Array.isArray(value.findings))
        throw new Error('This is not a compatible Accessibility report.');
      setter(value);
      setError('');
    } catch (fileError) {
      setter(null);
      setError(fileError instanceof Error ? fileError.message : String(fileError));
    }
  }

  const evidenceUrls = (job?.artifacts ?? []).map((name) => ({
    name,
    url: `/api/accessibility-checker/audits/${encodeURIComponent(job?.id ?? '')}/artifacts/${encodeURIComponent(name)}`,
  }));

  return (
    <div data-testid="accessibility-checker">
      <Form onSubmit={startAudit}>
        <Label>
          Website to test
          <UrlRow>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              inputMode="url"
              autoComplete="url"
              placeholder="example.com"
              required
            />
            <AuditButton
              type="submit"
              disabled={job?.status === 'queued' || job?.status === 'running'}
            >
              Run accessibility audit
            </AuditButton>
          </UrlRow>
        </Label>
        <Options>
          <Label>
            Journey profile
            <select
              value={profile}
              onChange={(event) => setProfile(event.target.value === 'full' ? 'full' : 'safe')}
            >
              <option value="safe">Safe investigation</option>
              <option value="full">Full ecommerce journey — may modify an isolated cart</option>
            </select>
          </Label>
          <Label>
            Clean repetitions
            <select value={repeats} onChange={(event) => setRepeats(Number(event.target.value))}>
              <option value={1}>1 — quick</option>
              <option value={2}>2 — reproducible</option>
              <option value={3}>3 — stronger evidence</option>
            </select>
          </Label>
        </Options>
        <Notice>
          <Dot aria-hidden="true" />
          <span>
            <strong>Server-assisted.</strong> The submitted public URL is opened in an isolated
            browser. Do not submit private, local, authenticated, or confidential targets.
          </span>
        </Notice>
        {error ? <ErrorText role="alert">{error}</ErrorText> : null}
      </Form>

      {job && ['queued', 'running'].includes(job.status) ? (
        <Progress aria-live="polite">
          <strong>{progressLabel(job)}</strong>
          <ProgressBar />
          <details>
            <summary>Live test log</summary>
            <Log>{job.logs.join('\n')}</Log>
          </details>
        </Progress>
      ) : null}
      {job?.status === 'failed' ? (
        <ErrorText role="alert">
          {job.error || 'The audit failed before producing a report.'}
        </ErrorText>
      ) : null}

      {report ? (
        <>
          <Section>
            <SectionHead>
              <div>
                <Title>Accessibility risk overview</Title>
                <a href={report.url} target="_blank" rel="noreferrer">
                  {report.url}
                </a>
              </div>
              <Actions>
                <Button type="button" variant="ghost" onClick={downloadReport}>
                  Download report
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setJob(null);
                    setUrl('');
                  }}
                >
                  Test another site
                </Button>
              </Actions>
            </SectionHead>
            <SummaryGrid>
              <SummaryCard primary>
                <span>Observed risk</span>
                <strong>{riskLabel(report, findings)}</strong>
                <small>Prioritised from this automated run</small>
              </SummaryCard>
              <SummaryCard>
                <span>Findings</span>
                <strong>{findings.length}</strong>
                <small>Observed and automated evidence</small>
              </SummaryCard>
              <SummaryCard>
                <span>Serious findings</span>
                <strong>
                  {
                    findings.filter((item) => ['critical', 'serious'].includes(item.impact ?? ''))
                      .length
                  }
                </strong>
                <small>Critical or serious impact</small>
              </SummaryCard>
              <SummaryCard>
                <span>Keyboard search</span>
                <strong>
                  {report.overall === 'possible-trap'
                    ? 'Possible trap'
                    : report.overall === 'no-trap-observed'
                      ? 'No trap seen'
                      : 'Inconclusive'}
                </strong>
                <small>Heuristic test result</small>
              </SummaryCard>
            </SummaryGrid>
            <AssessmentGrid>
              {(['confirmed', 'likely', 'review'] as const).map((tone) => (
                <AssessmentTile key={tone} tone={tone}>
                  <strong>{findings.filter((item) => item.assessment === tone).length}</strong>
                  <div>
                    <span>{tone}</span>
                    <small>{assessmentDescriptions[tone]}</small>
                  </div>
                </AssessmentTile>
              ))}
            </AssessmentGrid>
          </Section>

          {report.frameworks?.length ? (
            <Section>
              <SectionHead>
                <Title>Standards mapping</Title>
                <Muted>Mapped findings are investigation guidance, not legal certification.</Muted>
              </SectionHead>
              <FrameworkGrid>
                {report.frameworks.map((framework) => (
                  <FrameworkCard key={framework.name}>
                    <h3>{framework.name}</h3>
                    <p>
                      <strong>{framework.mappedFindingIds.length} mapped findings</strong>
                    </p>
                    <p>{framework.baseline}</p>
                    <p>{framework.applicability}</p>
                    <a href={framework.sourceUrl} target="_blank" rel="noreferrer">
                      Official framework source ↗
                    </a>
                  </FrameworkCard>
                ))}
              </FrameworkGrid>
            </Section>
          ) : null}

          <Section>
            <SectionHead>
              <div>
                <Title>Observed behavior and evidence</Title>
                <Muted>
                  {visibleFindings.length} of {findings.length} findings
                </Muted>
              </div>
              <Actions>
                {(['all', 'confirmed', 'likely', 'review'] as const).map((tone) => (
                  <FilterButton
                    type="button"
                    key={tone}
                    active={filter === tone}
                    onClick={() => setFilter(tone)}
                  >
                    {tone}
                  </FilterButton>
                ))}
              </Actions>
            </SectionHead>
            {visibleFindings.length ? (
              visibleFindings.map((finding) => {
                const tone =
                  finding.assessment ??
                  (finding.confidence === 'high'
                    ? 'confirmed'
                    : finding.confidence === 'medium'
                      ? 'likely'
                      : 'review');
                const evidence = finding.evidence ?? finding.nodes ?? [];
                return (
                  <FindingCard key={findingKey(finding)}>
                    <summary>
                      <Chip tone={tone}>{tone}</Chip>
                      <strong>{finding.title ?? finding.help}</strong>
                      <small>
                        {evidence.length} evidence item{evidence.length === 1 ? '' : 's'}
                      </small>
                    </summary>
                    <FindingBody>
                      <p>
                        <strong>Observed:</strong> {finding.observed ?? finding.description}
                      </p>
                      <p>
                        <strong>Why it matters:</strong>{' '}
                        {finding.whyItMatters ?? finding.description}
                      </p>
                      <Guidance>
                        {finding.inspect?.length ? (
                          <GuidanceCard>
                            <h3>Inspect</h3>
                            <ul>
                              {finding.inspect.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </GuidanceCard>
                        ) : null}
                        {finding.suggestedFixes?.length ? (
                          <GuidanceCard>
                            <h3>Suggested fixes</h3>
                            <ul>
                              {finding.suggestedFixes.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </GuidanceCard>
                        ) : null}
                        {finding.manualVerification?.length ? (
                          <GuidanceCard>
                            <h3>Manual verification</h3>
                            <ul>
                              {finding.manualVerification.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </GuidanceCard>
                        ) : null}
                      </Guidance>
                      {finding.relatedCriteria?.length ? (
                        <p>
                          <strong>Related:</strong> {finding.relatedCriteria.join(' · ')}
                        </p>
                      ) : null}
                      {finding.helpUrl ? (
                        <p>
                          <a href={finding.helpUrl} target="_blank" rel="noreferrer">
                            Related technical guidance ↗
                          </a>
                        </p>
                      ) : null}
                      {evidence.slice(0, 6).map((item, index) => (
                        <Code key={`${findingKey(finding)}-${index}`}>
                          {item.target?.join(' ') || 'Affected element'} —{' '}
                          {item.summary ?? item.failureSummary ?? item.html}
                        </Code>
                      ))}
                    </FindingBody>
                  </FindingCard>
                );
              })
            ) : (
              <Muted>
                No findings match this filter. Automated checks still do not replace manual testing.
              </Muted>
            )}
          </Section>

          {report.journey?.stages?.length ? (
            <Section>
              <SectionHead>
                <Title>Interaction journey</Title>
                {report.stability ? (
                  <Chip tone="review">
                    {report.stability.status} · {report.stability.repeats} runs
                  </Chip>
                ) : null}
              </SectionHead>
              <JourneyGrid>
                {report.journey.stages.map((stage, index) => (
                  <JourneyCard key={stage.id ?? index}>
                    <span>{stage.status}</span>
                    <h3>{stage.label}</h3>
                    <p>{stage.detail}</p>
                  </JourneyCard>
                ))}
              </JourneyGrid>
              {report.journey.caution ? <Muted>{report.journey.caution}</Muted> : null}
            </Section>
          ) : null}

          {evidenceUrls.length ? (
            <Section>
              <SectionHead>
                <Title>Browser screenshots</Title>
                <Muted>Select an image for full-size evidence review.</Muted>
              </SectionHead>
              <EvidenceGrid>
                {evidenceUrls.map((item, index) => (
                  <figure key={item.name}>
                    <ImageButton
                      type="button"
                      onClick={() => setPreview(index)}
                      aria-label={`Open screenshot ${index + 1}: ${item.name}`}
                    >
                      <EvidenceImage
                        src={item.url}
                        alt={`Audit screenshot: ${item.name}`}
                        width={1440}
                        height={1000}
                        sizes="(max-width: 680px) 100vw, 240px"
                        unoptimized
                      />
                    </ImageButton>
                    <figcaption>{item.name}</figcaption>
                  </figure>
                ))}
              </EvidenceGrid>
            </Section>
          ) : null}
        </>
      ) : null}

      <RegressionPanel>
        <RegressionHeader>
          <Title>Regression review</Title>
          <Muted>
            Compare portable JSON reports to see what was fixed, what remains, and what is new.
            Reports stay in this browser session.
          </Muted>
        </RegressionHeader>
        <CompareGrid>
          <UploadCard>
            <UploadCardHead>
              <StepBadge aria-hidden="true">01</StepBadge>
              <div>
                <UploadTitle>Choose the baseline</UploadTitle>
                <UploadCopy>
                  Upload the report captured before the changes you want to review.
                </UploadCopy>
              </div>
            </UploadCardHead>
            <UploadFooter>
              <UploadControl>
                <input
                  type="file"
                  accept=".json,application/json"
                  aria-label="Choose baseline report"
                  onChange={(event) => void readReport(event.target.files?.[0], setBaseline)}
                />
                <span>Choose baseline JSON</span>
              </UploadControl>
              <UploadStatus selected={Boolean(baseline)} title={baseline?.url}>
                {baseline ? baseline.url : 'No baseline selected'}
              </UploadStatus>
            </UploadFooter>
          </UploadCard>
          <UploadCard>
            <UploadCardHead>
              <StepBadge aria-hidden="true">02</StepBadge>
              <div>
                <UploadTitle>Choose the comparison</UploadTitle>
                <UploadCopy>
                  {report
                    ? 'The open audit is ready to compare. Upload another report only to replace it.'
                    : 'Upload the newer report, or run an audit above and use that result automatically.'}
                </UploadCopy>
              </div>
            </UploadCardHead>
            <UploadFooter>
              <UploadControl>
                <input
                  type="file"
                  accept=".json,application/json"
                  aria-label="Choose newer report"
                  onChange={(event) => void readReport(event.target.files?.[0], setNewer)}
                />
                <span>{report ? 'Replace with JSON' : 'Choose newer JSON'}</span>
              </UploadControl>
              <UploadStatus selected={Boolean(newer ?? report)} title={(newer ?? report)?.url}>
                {newer
                  ? newer.url
                  : report
                    ? `Current audit · ${report.url}`
                    : 'No comparison selected'}
              </UploadStatus>
            </UploadFooter>
          </UploadCard>
        </CompareGrid>
        {comparison ? (
          <CompareResult>
            <CompareCard>
              <strong>{comparison.resolved}</strong>
              <span>Resolved findings</span>
            </CompareCard>
            <CompareCard>
              <strong>{comparison.persistent}</strong>
              <span>Persistent findings</span>
            </CompareCard>
            <CompareCard>
              <strong>{comparison.added}</strong>
              <span>New findings</span>
            </CompareCard>
          </CompareResult>
        ) : null}
      </RegressionPanel>

      <Dialog
        ref={dialogRef}
        onClose={() => setPreview(null)}
        aria-labelledby="evidence-dialog-title"
      >
        <DialogHead>
          <div>
            <strong id="evidence-dialog-title">Audit evidence</strong>
            <div>{preview !== null ? `${preview + 1} / ${evidenceUrls.length}` : ''}</div>
          </div>
          <DialogButton type="button" size="sm" variant="ghost" onClick={() => setPreview(null)}>
            Close
          </DialogButton>
        </DialogHead>
        {preview !== null && evidenceUrls[preview] ? (
          <DialogImage
            src={evidenceUrls[preview].url}
            alt={`Audit screenshot: ${evidenceUrls[preview].name}`}
            width={1440}
            height={1000}
            sizes="100vw"
            unoptimized
          />
        ) : null}
        <DialogNav>
          <DialogButton
            type="button"
            size="sm"
            variant="ghost"
            disabled={evidenceUrls.length < 2}
            onClick={() =>
              setPreview((value) =>
                value === null ? 0 : (value - 1 + evidenceUrls.length) % evidenceUrls.length,
              )
            }
          >
            ← Previous
          </DialogButton>
          <span>{preview !== null ? evidenceUrls[preview]?.name : ''}</span>
          <DialogButton
            type="button"
            size="sm"
            variant="ghost"
            disabled={evidenceUrls.length < 2}
            onClick={() =>
              setPreview((value) => (value === null ? 0 : (value + 1) % evidenceUrls.length))
            }
          >
            Next →
          </DialogButton>
        </DialogNav>
      </Dialog>
    </div>
  );
}
