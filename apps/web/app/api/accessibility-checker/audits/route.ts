import type { NextRequest } from 'next/server';
import { callAccessibilityRunner } from '@/lib/accessibility-runner';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<Response> {
  return callAccessibilityRunner(request, '/audits', {
    method: 'POST',
    body: await request.text(),
  });
}
