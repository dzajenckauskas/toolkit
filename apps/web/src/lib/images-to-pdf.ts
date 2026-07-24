/**
 * Minimal PDF writer that embeds JPEG images (one per page) with no external
 * dependency. JPEGs are stored directly via the /DCTDecode filter, so the
 * component just needs to convert each image to JPEG bytes first. Pure and
 * unit-testable (the JPEG conversion is the browser-only part).
 */

export interface PdfImage {
  jpeg: Uint8Array;
  width: number;
  height: number;
}

const encoder = new TextEncoder();

/** Build a single-column, one-image-per-page PDF. Returns the file bytes. */
export function buildPdf(images: PdfImage[]): Uint8Array {
  if (images.length === 0) throw new Error('Add at least one image.');

  const parts: Uint8Array[] = [];
  let length = 0;
  const offsets: number[] = []; // offsets[objNumber] = byte offset

  const push = (chunk: string | Uint8Array) => {
    const bytes = typeof chunk === 'string' ? encoder.encode(chunk) : chunk;
    parts.push(bytes);
    length += bytes.length;
  };
  const startObject = (n: number) => {
    offsets[n] = length;
  };

  // Object numbering: 1 = Catalog, 2 = Pages, then per image i: page, image, content.
  const pageObj = (i: number) => 3 + i * 3;
  const imageObj = (i: number) => 4 + i * 3;
  const contentObj = (i: number) => 5 + i * 3;
  const totalObjects = 2 + images.length * 3;

  push('%PDF-1.4\n%\xff\xff\xff\xff\n');

  // 1: Catalog
  startObject(1);
  push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // 2: Pages
  startObject(2);
  const kids = images.map((_, i) => `${pageObj(i)} 0 R`).join(' ');
  push(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${images.length} >>\nendobj\n`);

  images.forEach((img, i) => {
    const w = Math.max(1, Math.round(img.width));
    const h = Math.max(1, Math.round(img.height));

    // Page
    startObject(pageObj(i));
    push(
      `${pageObj(i)} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] ` +
        `/Resources << /XObject << /Im0 ${imageObj(i)} 0 R >> >> ` +
        `/Contents ${contentObj(i)} 0 R >>\nendobj\n`,
    );

    // Image XObject
    startObject(imageObj(i));
    push(
      `${imageObj(i)} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.jpeg.length} >>\nstream\n`,
    );
    push(img.jpeg);
    push('\nendstream\nendobj\n');

    // Content stream (draw the image to fill the page)
    startObject(contentObj(i));
    const content = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`;
    push(
      `${contentObj(i)} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`,
    );
  });

  // xref
  const xrefOffset = length;
  push(`xref\n0 ${totalObjects + 1}\n`);
  push('0000000000 65535 f \n');
  for (let n = 1; n <= totalObjects; n++) {
    push(`${String(offsets[n] ?? 0).padStart(10, '0')} 00000 n \n`);
  }
  push(`trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  const out = new Uint8Array(length);
  let pos = 0;
  for (const part of parts) {
    out.set(part, pos);
    pos += part.length;
  }
  return out;
}
