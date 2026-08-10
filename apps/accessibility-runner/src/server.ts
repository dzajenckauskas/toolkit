import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { createReadStream, existsSync, mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSafeRemoteUrl } from './network-safety.js';

const host = process.env.ACCESSIBILITY_RUNNER_HOST ?? '127.0.0.1';
const port = Number(process.env.ACCESSIBILITY_RUNNER_PORT ?? 4317);
const production = process.env.NODE_ENV === 'production';
const token =
  process.env.ACCESSIBILITY_RUNNER_TOKEN ?? (production ? '' : 'dev-accessibility-runner-token');
if (!token) throw new Error('ACCESSIBILITY_RUNNER_TOKEN is required in production.');

const maxConcurrent = Math.max(1, Number(process.env.ACCESSIBILITY_MAX_CONCURRENT ?? 1));
const maxQueued = Math.max(0, Number(process.env.ACCESSIBILITY_MAX_QUEUED ?? 3));
const maxRuntimeMs = Math.max(60_000, Number(process.env.ACCESSIBILITY_MAX_RUNTIME_MS ?? 480_000));
const artifactTtlMs = Math.max(
  60_000,
  Number(process.env.ACCESSIBILITY_ARTIFACT_TTL_MS ?? 3_600_000),
);
const rateWindowMs = 15 * 60_000;
const maxStartsPerWindow = 3;
const resultsDirectory = realpathSync(mkdtempSync(path.join(tmpdir(), 'toolkit-accessibility-')));
const dirname = path.dirname(fileURLToPath(import.meta.url));
const auditEntry = path.resolve(dirname, '..', 'tests', 'audit.js');

type AuditStatus = 'queued' | 'running' | 'complete' | 'failed';
type AuditJob = {
  id: string;
  url: string;
  profile: 'safe' | 'full';
  repeats: number;
  status: AuditStatus;
  startedAt: string | null;
  createdAt: string;
  finishedAt: string | null;
  logs: string[];
  reportPath: string | null;
  report: unknown;
  artifacts: string[];
  error: string | null;
  child: ChildProcess | null;
};

const jobs = new Map<string, AuditJob>();
const queue: string[] = [];
const rateStarts = new Map<string, number[]>();
let active = 0;

process.on('exit', () => rmSync(resultsDirectory, { recursive: true, force: true }));

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

function authorised(request: IncomingMessage): boolean {
  const supplied = request.headers.authorization?.replace(/^Bearer\s+/i, '') ?? '';
  const expected = Buffer.from(token);
  const received = Buffer.from(supplied);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

async function body(request: IncomingMessage): Promise<Record<string, unknown>> {
  let value = '';
  for await (const chunk of request) {
    value += chunk;
    if (value.length > 10_000) throw new Error('Request body is too large.');
  }
  return JSON.parse(value || '{}') as Record<string, unknown>;
}

function publicJob(job: AuditJob) {
  const { reportPath: _reportPath, child: _child, ...safe } = job;
  return { ...safe, queuePosition: job.status === 'queued' ? queue.indexOf(job.id) + 1 : null };
}

function enforceRateLimit(key: string): void {
  const cutoff = Date.now() - rateWindowMs;
  const recent = (rateStarts.get(key) ?? []).filter((time) => time > cutoff);
  if (recent.length >= maxStartsPerWindow) throw new Error('RATE_LIMIT');
  recent.push(Date.now());
  rateStarts.set(key, recent);
}

function appendOutput(job: AuditJob, chunk: Buffer): void {
  const lines = chunk
    .toString()
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);
  job.logs.push(...lines);
  job.logs = job.logs.slice(-240);
  for (const line of lines) {
    const match = line.match(/^Report:\s+(.+report\.json)$/);
    if (match?.[1]) job.reportPath = match[1];
  }
}

function expireJob(job: AuditJob): void {
  setTimeout(() => {
    if (job.reportPath) rmSync(path.dirname(job.reportPath), { recursive: true, force: true });
    jobs.delete(job.id);
  }, artifactTtlMs).unref();
}

async function finish(job: AuditJob, exitCode: number | null, timedOut: boolean): Promise<void> {
  job.finishedAt = new Date().toISOString();
  job.child = null;
  if (timedOut || exitCode !== 0 || !job.reportPath) {
    job.status = 'failed';
    const diagnostic = [...job.logs]
      .reverse()
      .find((line) =>
        /^(Error|TimeoutError|TypeError|ReferenceError|SyntaxError):|net::ERR_|Target page, context or browser has been closed/i.test(
          line,
        ),
      );
    job.error = timedOut
      ? 'The audit exceeded the maximum runtime and was stopped.'
      : diagnostic
        ? `The audit failed: ${diagnostic}`
        : `The audit stopped before producing a report (exit ${exitCode ?? 'unknown'}).`;
  } else {
    try {
      const resolved = path.resolve(job.reportPath);
      if (!resolved.startsWith(resultsDirectory + path.sep))
        throw new Error('Unexpected report path.');
      job.reportPath = resolved;
      job.report = JSON.parse(await readFile(resolved, 'utf8'));
      job.artifacts = (await readdir(path.dirname(resolved))).filter((name) =>
        name.endsWith('.png'),
      );
      job.status = 'complete';
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
    }
  }
  active -= 1;
  expireJob(job);
  runNext();
}

function run(job: AuditJob): void {
  active += 1;
  job.status = 'running';
  job.startedAt = new Date().toISOString();
  let timedOut = false;
  const child = spawn(
    process.execPath,
    [
      auditEntry,
      job.url,
      '--headless',
      `--repeats=${job.repeats}`,
      '--max-search-tabs=250',
      '--step-delay=35',
      `--profile=${job.profile}`,
    ],
    {
      env: { ...process.env, FORCE_COLOR: '0', ACCESSIBILITY_RESULTS_DIR: resultsDirectory },
    },
  );
  job.child = child;
  child.stdout?.on('data', (chunk: Buffer) => appendOutput(job, chunk));
  child.stderr?.on('data', (chunk: Buffer) => appendOutput(job, chunk));
  child.on('error', (error) => job.logs.push(`Error: ${error.message}`));
  const timeout = setTimeout(() => {
    timedOut = true;
    child.kill('SIGTERM');
    setTimeout(() => child.kill('SIGKILL'), 5_000).unref();
  }, maxRuntimeMs);
  timeout.unref();
  child.on('close', (code) => {
    clearTimeout(timeout);
    void finish(job, code, timedOut);
  });
}

function runNext(): void {
  while (active < maxConcurrent && queue.length) {
    const id = queue.shift();
    const job = id ? jobs.get(id) : undefined;
    if (job?.status === 'queued') run(job);
  }
}

function enqueue(url: string, profile: 'safe' | 'full', repeats: number): AuditJob {
  if (queue.length >= maxQueued) throw new Error('QUEUE_FULL');
  const job: AuditJob = {
    id: randomUUID(),
    url,
    profile,
    repeats,
    status: 'queued',
    createdAt: new Date().toISOString(),
    startedAt: null,
    finishedAt: null,
    logs: [],
    reportPath: null,
    report: null,
    artifacts: [],
    error: null,
    child: null,
  };
  jobs.set(job.id, job);
  queue.push(job.id);
  runNext();
  return job;
}

async function serveArtifact(response: ServerResponse, job: AuditJob, name: string): Promise<void> {
  if (!job.reportPath || !job.artifacts.includes(name))
    return json(response, 404, { error: 'Artifact not found.' });
  const filename = path.join(path.dirname(job.reportPath), name);
  if (!existsSync(filename)) return json(response, 404, { error: 'Artifact expired.' });
  const info = await stat(filename);
  response.writeHead(200, {
    'content-type': 'image/png',
    'content-length': info.size,
    'cache-control': 'private, max-age=300',
  });
  createReadStream(filename).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? host}`);
    if (request.method === 'GET' && requestUrl.pathname === '/health') {
      return json(response, 200, { ok: true, active, queued: queue.length });
    }
    if (!authorised(request)) return json(response, 401, { error: 'Unauthorized.' });

    if (request.method === 'POST' && requestUrl.pathname === '/audits') {
      const client = String(request.headers['x-client-ip'] ?? 'unknown');
      const value = await body(request);
      const url = (await assertSafeRemoteUrl(String(value.url ?? ''))).toString();
      enforceRateLimit(client);
      const profile = value.profile === 'full' ? 'full' : 'safe';
      const repeats = Math.max(1, Math.min(3, Number(value.repeats) || 2));
      return json(response, 202, publicJob(enqueue(url, profile, repeats)));
    }

    const jobMatch = requestUrl.pathname.match(/^\/audits\/([^/]+)$/);
    if (request.method === 'GET' && jobMatch?.[1]) {
      const job = jobs.get(jobMatch[1]);
      return json(
        response,
        job ? 200 : 404,
        job ? publicJob(job) : { error: 'Audit not found or expired.' },
      );
    }

    const artifactMatch = requestUrl.pathname.match(/^\/audits\/([^/]+)\/artifacts\/([^/]+)$/);
    if (request.method === 'GET' && artifactMatch?.[1] && artifactMatch[2]) {
      const job = jobs.get(artifactMatch[1]);
      if (!job) return json(response, 404, { error: 'Audit not found or expired.' });
      return await serveArtifact(response, job, decodeURIComponent(artifactMatch[2]));
    }
    return json(response, 404, { error: 'Endpoint not found.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === 'RATE_LIMIT')
      return json(response, 429, { error: 'Too many audits. Try again later.' });
    if (message === 'QUEUE_FULL')
      return json(response, 503, { error: 'The audit queue is full. Try again shortly.' });
    return json(response, error instanceof SyntaxError ? 400 : 422, { error: message });
  }
});

server.listen(port, host, () =>
  console.log(`Accessibility runner listening on http://${host}:${port}`),
);
