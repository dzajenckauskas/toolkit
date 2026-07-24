/**
 * JWT decoding (inspection only — no signature verification, which needs the
 * secret/key). Splits the token and base64url-decodes the header and payload.
 * Pure; works in the browser and in jsdom/Node.
 */

export interface DecodedJwt {
  header: unknown;
  payload: unknown;
  signature: string;
}

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Decode a JWT into its header and payload objects. Throws when the token is
 * malformed or a segment is not valid JSON.
 */
export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('A JWT has three dot-separated parts.');
  }
  const [header, payload, signature] = parts as [string, string, string];
  try {
    return {
      header: JSON.parse(base64UrlDecode(header)),
      payload: JSON.parse(base64UrlDecode(payload)),
      signature,
    };
  } catch {
    throw new Error('The header or payload is not valid Base64URL-encoded JSON.');
  }
}
