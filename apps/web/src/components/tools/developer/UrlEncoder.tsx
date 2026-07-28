'use client';

import EncodeDecodeTool from '@/components/tools/shared/EncodeDecodeTool';
import { encodeUrl, tryDecodeUrl } from '@toolkit/lib/url-encode';

export default function UrlEncoder() {
  return (
    <EncodeDecodeTool
      encode={encodeUrl}
      decode={tryDecodeUrl}
      decodeError="That is not a valid percent-encoded string."
      encodePlaceholder="Text to encode…"
      decodePlaceholder="Percent-encoded text to decode…"
      testIdPrefix="url"
    />
  );
}
