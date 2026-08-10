import assert from 'node:assert/strict';
import test from 'node:test';
import { isPublicAddress } from './network-safety.js';

test('rejects private and metadata IPv4 ranges', () => {
  for (const address of ['127.0.0.1', '10.2.3.4', '172.16.0.1', '192.168.1.2', '169.254.169.254']) {
    assert.equal(isPublicAddress(address), false, address);
  }
});

test('rejects private IPv6 ranges and accepts public addresses', () => {
  assert.equal(isPublicAddress('::1'), false);
  assert.equal(isPublicAddress('fd00::1'), false);
  assert.equal(isPublicAddress('2606:4700:4700::1111'), true);
  assert.equal(isPublicAddress('1.1.1.1'), true);
});
