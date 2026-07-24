/**
 * Password-based text encryption using Web Crypto: PBKDF2 (SHA-256, 150k
 * iterations) to derive an AES-GCM key, with a random salt + IV per message.
 * The output is base64 of salt(16) ++ iv(12) ++ ciphertext. Works in the
 * browser and in Node's webcrypto.
 */

import { bytesToArrayBuffer, encodeToArrayBuffer } from './webcrypto';

const PBKDF2_ITERATIONS = 150_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64.trim());
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encodeToArrayBuffer(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: bytesToArrayBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** Encrypt `plaintext` with `password`; returns a base64 token. */
export async function encryptText(plaintext: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(password, salt);
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: bytesToArrayBuffer(iv) },
      key,
      encodeToArrayBuffer(plaintext),
    ),
  );
  const out = new Uint8Array(salt.length + iv.length + cipher.length);
  out.set(salt, 0);
  out.set(iv, salt.length);
  out.set(cipher, salt.length + iv.length);
  return bytesToBase64(out);
}

/** Decrypt a base64 token with `password`. Throws on a wrong password or corrupt data. */
export async function decryptText(token: string, password: string): Promise<string> {
  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(token);
  } catch {
    throw new Error('This is not a valid encrypted message.');
  }
  if (bytes.length <= SALT_BYTES + IV_BYTES) {
    throw new Error('This is not a valid encrypted message.');
  }
  const salt = bytes.slice(0, SALT_BYTES);
  const iv = bytes.slice(SALT_BYTES, SALT_BYTES + IV_BYTES);
  const cipher = bytes.slice(SALT_BYTES + IV_BYTES);
  const key = await deriveKey(password, salt);
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: bytesToArrayBuffer(iv) },
      key,
      bytesToArrayBuffer(cipher),
    );
    return new TextDecoder().decode(plain);
  } catch {
    throw new Error('Wrong password, or the message has been altered.');
  }
}
