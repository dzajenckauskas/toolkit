import type { NextRequest } from 'next/server';
import { callAccessibilityRunner } from '@/lib/accessibility-runner';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return callAccessibilityRunner(request, `/audits/${encodeURIComponent(id)}`);
}
