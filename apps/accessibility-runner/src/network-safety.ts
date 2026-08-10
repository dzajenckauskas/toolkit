import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { expiresAt: number; addresses: string[] }>();

function ipv4Number(address: string): number {
  return address.split('.').reduce((value, part) => (value << 8) + Number(part), 0) >>> 0;
}

function inIpv4Range(address: string, base: string, bits: number): boolean {
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipv4Number(address) & mask) === (ipv4Number(base) & mask);
}

export function isPublicAddress(address: string): boolean {
  if (isIP(address) === 4) {
    return ![
      ['0.0.0.0', 8],
      ['10.0.0.0', 8],
      ['100.64.0.0', 10],
      ['127.0.0.0', 8],
      ['169.254.0.0', 16],
      ['172.16.0.0', 12],
      ['192.0.0.0', 24],
      ['192.0.2.0', 24],
      ['192.168.0.0', 16],
      ['198.18.0.0', 15],
      ['198.51.100.0', 24],
      ['203.0.113.0', 24],
      ['224.0.0.0', 4],
      ['240.0.0.0', 4],
    ].some(([base, bits]) => inIpv4Range(address, String(base), Number(bits)));
  }

  if (isIP(address) === 6) {
    const normalized = address.toLowerCase();
    if (normalized.startsWith('::ffff:')) return isPublicAddress(normalized.slice(7));
    return !(
      normalized === '::' ||
      normalized === '::1' ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd') ||
      /^fe[89ab]/.test(normalized) ||
      normalized.startsWith('ff') ||
      normalized.startsWith('2001:db8:')
    );
  }

  return false;
}

async function resolveHost(hostname: string): Promise<string[]> {
  const cached = cache.get(hostname);
  if (cached && cached.expiresAt > Date.now()) return cached.addresses;
  const addresses = (await lookup(hostname, { all: true, verbatim: true })).map(
    ({ address }) => address,
  );
  if (!addresses.length) throw new Error('The website hostname did not resolve.');
  cache.set(hostname, { addresses, expiresAt: Date.now() + CACHE_TTL_MS });
  return addresses;
}

export async function assertSafeRemoteUrl(value: string): Promise<URL> {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error('Only HTTP and HTTPS websites can be tested.');
  if (url.username || url.password) throw new Error('Website URLs cannot contain credentials.');
  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (
    !hostname ||
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local')
  ) {
    throw new Error('Local and private network websites cannot be tested.');
  }
  const addresses = isIP(hostname) ? [hostname] : await resolveHost(hostname);
  if (addresses.some((address) => !isPublicAddress(address))) {
    throw new Error('Local, private, reserved, and metadata network addresses cannot be tested.');
  }
  return url;
}
