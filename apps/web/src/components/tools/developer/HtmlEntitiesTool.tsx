'use client';

import EncodeDecodeTool from '@/components/tools/shared/EncodeDecodeTool';
import { decodeHtml, encodeHtml } from '@toolkit/lib/html-entities';

export default function HtmlEntitiesTool() {
  return (
    <EncodeDecodeTool
      encode={encodeHtml}
      decode={decodeHtml}
      decodeError=""
      encodePlaceholder="Text to escape…"
      decodePlaceholder="HTML with entities to unescape…"
      testIdPrefix="html"
    />
  );
}
