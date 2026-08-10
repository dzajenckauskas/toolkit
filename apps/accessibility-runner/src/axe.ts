import { AxeBuilder } from '@axe-core/playwright';
import type { Page } from 'playwright';

export type AxeSummary = {
  violations: Array<{
    id: string;
    impact: string | null;
    help: string;
    description: string;
    helpUrl: string;
    tags: string[];
    nodes: Array<{
      target: string[];
      html: string;
      failureSummary: string | null;
    }>;
  }>;
  passes: number;
  incomplete: number;
};

export async function runAxeAudit(page: Page): Promise<AxeSummary> {
  const results = await new AxeBuilder({ page }).analyze();
  return {
    violations: results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact ?? null,
      help: violation.help,
      description: violation.description,
      helpUrl: violation.helpUrl,
      tags: violation.tags,
      nodes: violation.nodes.map((node) => ({
        target: node.target.map(String),
        html: node.html.slice(0, 600),
        failureSummary: node.failureSummary ?? null,
      })),
    })),
    passes: results.passes.length,
    incomplete: results.incomplete.length,
  };
}
