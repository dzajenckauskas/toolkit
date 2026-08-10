import 'server-only';
import type { NextRequest } from 'next/server';

const runnerUrl = process.env.ACCESSIBILITY_RUNNER_URL ?? 'http://127.0.0.1:4317';

function runnerToken(): string {
  const token =
    process.env.ACCESSIBILITY_RUNNER_TOKEN ??
    (process.env.NODE_ENV === 'production' ? '' : 'dev-accessibility-runner-token');
  if (!token) throw new Error('Accessibility runner is not configured.');
  return token;
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function callAccessibilityRunner(
  request: NextRequest,
  pathname: string,
  init: RequestInit = {},
): Promise<Response> {
  try {
    const headers = new Headers(init.headers);
    headers.set('authorization', `Bearer ${runnerToken()}`);
    headers.set('x-client-ip', clientIp(request));
    if (init.body) headers.set('content-type', 'application/json');
    const upstream = await fetch(new URL(pathname, runnerUrl), {
      ...init,
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
        'cache-control': upstream.headers.get('cache-control') ?? 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json(
      { error: `Accessibility runner unavailable: ${message}` },
      { status: 503 },
    );
  }
}
