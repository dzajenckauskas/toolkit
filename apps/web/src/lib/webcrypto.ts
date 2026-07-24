/**
 * Web Crypto's typings (newer TS lib) want a `BufferSource` backed by a plain
 * `ArrayBuffer`, while `TextEncoder.encode()`, `getRandomValues()` and typed
 * views are generic over `ArrayBufferLike`. Copying into a fresh `ArrayBuffer`
 * satisfies the types and is correct at runtime; the copies are tiny.
 */
export function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

/** Encode a string to an ArrayBuffer (UTF-8) for Web Crypto calls. */
export function encodeToArrayBuffer(text: string): ArrayBuffer {
  return bytesToArrayBuffer(new TextEncoder().encode(text));
}
