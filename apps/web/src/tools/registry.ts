/**
 * Tool registry — the single source of truth for the tool hub (ADR-008).
 *
 * The catalog landing page, search, and navigation all read from here. Adding a
 * tool = add an entry (and its route). `status` gates whether it links or shows
 * as "coming soon".
 */

export type ToolStatus = 'live' | 'planned';

export type ToolCategory =
  | 'Images & Media'
  | 'Text & Documents'
  | 'PDF'
  | 'Developer'
  | 'Design'
  | 'Privacy'
  | 'Productivity'
  | 'Calculators';

export interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  category: ToolCategory;
  status: ToolStatus;
}

/** Display order for categories on the catalog. */
export const CATEGORY_ORDER: ToolCategory[] = [
  'Images & Media',
  'Text & Documents',
  'PDF',
  'Developer',
  'Design',
  'Privacy',
  'Productivity',
  'Calculators',
];

export const TOOLS: Tool[] = [
  // Images & Media
  {
    id: 'optimize',
    name: 'Compress image',
    description: 'Reduce JPEG file size in your browser.',
    href: '/optimize',
    category: 'Images & Media',
    status: 'live',
  },
  {
    id: 'crop',
    name: 'Crop image',
    description: 'Frame and crop to any aspect ratio.',
    href: '/crop',
    category: 'Images & Media',
    status: 'live',
  },
  {
    id: 'resize',
    name: 'Resize image',
    description: 'Change image dimensions precisely.',
    href: '/resize',
    category: 'Images & Media',
    status: 'live',
  },
  {
    id: 'convert',
    name: 'Convert image',
    description: 'Convert between JPG, PNG and WebP.',
    href: '/convert',
    category: 'Images & Media',
    status: 'live',
  },
  {
    id: 'rotate',
    name: 'Rotate & flip',
    description: 'Rotate or flip an image any direction.',
    href: '/rotate',
    category: 'Images & Media',
    status: 'live',
  },
  {
    id: 'image-editor',
    name: 'Image editor',
    description: 'Adjust and edit images in one workspace.',
    href: '/image-editor',
    category: 'Images & Media',
    status: 'planned',
  },
  {
    id: 'screenshot',
    name: 'Screenshot beautifier',
    description: 'Add padding, backgrounds and shadows.',
    href: '/screenshot',
    category: 'Images & Media',
    status: 'planned',
  },
  {
    id: 'qr',
    name: 'QR code',
    description: 'Generate a QR code for any link or text.',
    href: '/qr',
    category: 'Images & Media',
    status: 'live',
  },
  {
    id: 'code-image',
    name: 'Code image',
    description: 'Turn a code snippet into a shareable image.',
    href: '/code-image',
    category: 'Images & Media',
    status: 'planned',
  },
  {
    id: 'favicon',
    name: 'Favicon generator',
    description: 'Create favicons from an image.',
    href: '/favicon',
    category: 'Images & Media',
    status: 'live',
  },
  {
    id: 'handwriting',
    name: 'Text to handwriting',
    description: 'Render typed text as handwriting.',
    href: '/handwriting',
    category: 'Images & Media',
    status: 'planned',
  },
  {
    id: 'video-editor',
    name: 'Video editor',
    description: 'Trim and edit short video clips.',
    href: '/video-editor',
    category: 'Images & Media',
    status: 'planned',
  },
  {
    id: 'upscale',
    name: 'Upscale image',
    description: 'Enlarge images (AI — later; see roadmap).',
    href: '/upscale',
    category: 'Images & Media',
    status: 'planned',
  },
  {
    id: 'remove-watermark',
    name: 'Remove watermark',
    description: 'Own-watermark removal (policy pending).',
    href: '/remove-watermark',
    category: 'Images & Media',
    status: 'planned',
  },

  // Text & Documents
  {
    id: 'markdown',
    name: 'Markdown',
    description: 'Markdown editor with live preview.',
    href: '/markdown',
    category: 'Text & Documents',
    status: 'live',
  },
  {
    id: 'mermaid',
    name: 'Mermaid',
    description: 'Live Mermaid diagram editor with export.',
    href: '/mermaid',
    category: 'Text & Documents',
    status: 'planned',
  },
  {
    id: 'markdown-mermaid',
    name: 'Markdown + Mermaid',
    description: 'Markdown with embedded Mermaid diagrams.',
    href: '/markdown-mermaid',
    category: 'Text & Documents',
    status: 'planned',
  },
  {
    id: 'text-diff',
    name: 'Text diff',
    description: 'Compare two texts with highlighted changes.',
    href: '/text-diff',
    category: 'Text & Documents',
    status: 'live',
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum',
    description: 'Generate placeholder text for layouts.',
    href: '/lorem-ipsum',
    category: 'Text & Documents',
    status: 'live',
  },
  {
    id: 'case-converter',
    name: 'Case converter',
    description: 'Convert between camelCase, snake_case, Title Case and more.',
    href: '/case-converter',
    category: 'Text & Documents',
    status: 'live',
  },
  {
    id: 'line-tools',
    name: 'Line tools',
    description: 'Sort, de-duplicate, reverse and clean lines of text.',
    href: '/line-tools',
    category: 'Text & Documents',
    status: 'live',
  },
  {
    id: 'word-count',
    name: 'Word & character counter',
    description: 'Count words, characters, sentences and reading time.',
    href: '/word-count',
    category: 'Text & Documents',
    status: 'live',
  },
  {
    id: 'slugify',
    name: 'Slugify',
    description: 'Turn text into a clean URL slug.',
    href: '/slugify',
    category: 'Text & Documents',
    status: 'live',
  },

  // PDF
  {
    id: 'pdf-editor',
    name: 'PDF editor',
    description: 'View and edit PDF pages.',
    href: '/pdf-editor',
    category: 'PDF',
    status: 'planned',
  },
  {
    id: 'redact-pdf',
    name: 'Redact PDF',
    description: 'Black out sensitive parts of a PDF.',
    href: '/redact-pdf',
    category: 'PDF',
    status: 'planned',
  },
  {
    id: 'images-to-pdf',
    name: 'Images to PDF',
    description: 'Combine images into a single PDF.',
    href: '/images-to-pdf',
    category: 'PDF',
    status: 'planned',
  },

  // Developer
  {
    id: 'json',
    name: 'JSON validator',
    description: 'Validate, format and minify JSON.',
    href: '/json',
    category: 'Developer',
    status: 'live',
  },
  {
    id: 'jwt',
    name: 'JWT',
    description: 'Decode and inspect JSON Web Tokens.',
    href: '/jwt',
    category: 'Developer',
    status: 'live',
  },
  {
    id: 'regex',
    name: 'Regex tester',
    description: 'Test regular expressions live.',
    href: '/regex',
    category: 'Developer',
    status: 'live',
  },
  {
    id: 'base64',
    name: 'Base64',
    description: 'Encode and decode Base64.',
    href: '/base64',
    category: 'Developer',
    status: 'live',
  },
  {
    id: 'hash',
    name: 'Hash generator',
    description: 'Generate SHA-1/256/384/512 hashes.',
    href: '/hash',
    category: 'Developer',
    status: 'live',
  },
  {
    id: 'checksum',
    name: 'File checksum verifier',
    description: 'Verify a file against a checksum.',
    href: '/checksum',
    category: 'Developer',
    status: 'live',
  },
  {
    id: 'uuid',
    name: 'UUID generator',
    description: 'Generate random UUIDs (v4).',
    href: '/uuid',
    category: 'Developer',
    status: 'live',
  },
  {
    id: 'password',
    name: 'Password generator',
    description: 'Generate strong random passwords.',
    href: '/password',
    category: 'Developer',
    status: 'live',
  },
  {
    id: 'url-encode',
    name: 'URL encode / decode',
    description: 'Percent-encode and decode URL components.',
    href: '/url-encode',
    category: 'Developer',
    status: 'live',
  },
  {
    id: 'html-entities',
    name: 'HTML entities',
    description: 'Escape and unescape HTML entities.',
    href: '/html-entities',
    category: 'Developer',
    status: 'live',
  },
  {
    id: 'number-base',
    name: 'Number base converter',
    description: 'Convert between binary, octal, decimal and hex.',
    href: '/number-base',
    category: 'Developer',
    status: 'live',
  },
  {
    id: 'totp',
    name: 'TOTP / 2FA generator',
    description: 'Generate two-factor codes from a secret.',
    href: '/totp',
    category: 'Developer',
    status: 'live',
  },
  {
    id: 'hmac',
    name: 'HMAC generator',
    description: 'Compute a keyed HMAC signature.',
    href: '/hmac',
    category: 'Developer',
    status: 'live',
  },
  {
    id: 'timestamp',
    name: 'Unix timestamp converter',
    description: 'Convert between Unix timestamps and dates.',
    href: '/timestamp',
    category: 'Developer',
    status: 'live',
  },
  {
    id: 'csv-json',
    name: 'CSV ↔ JSON',
    description: 'Convert between CSV and JSON.',
    href: '/csv-json',
    category: 'Developer',
    status: 'live',
  },

  // Design
  {
    id: 'colors',
    name: 'Colors',
    description: 'Convert colors between HEX, RGB and HSL.',
    href: '/colors',
    category: 'Design',
    status: 'live',
  },
  {
    id: 'contrast',
    name: 'Contrast checker',
    description: 'Check color contrast against WCAG AA/AAA.',
    href: '/contrast',
    category: 'Design',
    status: 'live',
  },
  {
    id: 'diagram',
    name: 'Diagram builder',
    description: 'Build simple diagrams.',
    href: '/diagram',
    category: 'Design',
    status: 'planned',
  },

  // Privacy
  {
    id: 'metadata-cleaner',
    name: 'Metadata cleaner',
    description: 'Strip EXIF/GPS metadata from images.',
    href: '/metadata-cleaner',
    category: 'Privacy',
    status: 'live',
  },
  {
    id: 'encrypt',
    name: 'Text encrypt / decrypt',
    description: 'Password-based AES-256 text encryption.',
    href: '/encrypt',
    category: 'Privacy',
    status: 'live',
  },

  // Productivity
  {
    id: 'focus-timer',
    name: 'Focus timer',
    description: 'A simple Pomodoro-style timer.',
    href: '/focus-timer',
    category: 'Productivity',
    status: 'live',
  },
  {
    id: 'kanban',
    name: 'Kanban board',
    description: 'A lightweight local kanban board.',
    href: '/kanban',
    category: 'Productivity',
    status: 'planned',
  },

  // Calculators
  {
    id: 'calculator',
    name: 'Notepad calculator',
    description: 'Calculate as you type, line by line.',
    href: '/calculator',
    category: 'Calculators',
    status: 'live',
  },
  {
    id: 'unit-converter',
    name: 'Unit converter',
    description: 'Convert length, weight, data, time and temperature.',
    href: '/unit-converter',
    category: 'Calculators',
    status: 'live',
  },
  {
    id: 'percentage',
    name: 'Percentage calculator',
    description: 'Percentages, percent change and tip splitting.',
    href: '/percentage',
    category: 'Calculators',
    status: 'live',
  },
];

/**
 * Action-style synonyms per tool, so a command-palette search matches what a
 * user would *do* ("encode", "minify", "sha256") not just the tool's name.
 * Keyed by tool id; tools without an entry still match name/description/category.
 */
export const TOOL_KEYWORDS: Record<string, string[]> = {
  optimize: ['compress', 'shrink', 'reduce', 'jpeg', 'size'],
  crop: ['trim', 'cut', 'aspect ratio'],
  resize: ['scale', 'dimensions', 'width', 'height', 'shrink', 'enlarge'],
  convert: ['jpg', 'jpeg', 'png', 'webp', 'format', 'transcode'],
  rotate: ['flip', 'mirror', 'turn', 'orientation'],
  favicon: ['icon', 'ico', 'app icon', 'sizes'],
  uuid: ['guid', 'unique id', 'v4', 'identifier'],
  base64: ['encode', 'decode', 'b64'],
  password: ['passphrase', 'random', 'secret', 'credentials'],
  json: ['format', 'minify', 'beautify', 'pretty', 'validate'],
  hash: ['sha', 'sha1', 'sha256', 'sha512', 'digest', 'md5'],
  jwt: ['token', 'decode', 'bearer', 'claims'],
  regex: ['regexp', 'pattern', 'match', 'test'],
  checksum: ['verify', 'sha', 'integrity', 'digest'],
  'lorem-ipsum': ['placeholder', 'dummy text', 'filler', 'lipsum'],
  'text-diff': ['compare', 'difference', 'changes', 'merge'],
  colors: ['hex', 'rgb', 'hsl', 'convert', 'palette', 'picker'],
  'metadata-cleaner': ['exif', 'gps', 'strip', 'privacy', 'remove metadata'],
  'focus-timer': ['pomodoro', 'timer', 'countdown', 'productivity'],
  calculator: ['calc', 'math', 'arithmetic', 'sum'],
  'url-encode': ['percent', 'uri', 'escape', 'querystring', 'encode', 'decode'],
  'html-entities': ['escape', 'unescape', 'entity', 'ampersand', 'encode', 'decode'],
  'number-base': ['binary', 'hex', 'hexadecimal', 'octal', 'decimal', 'radix', 'convert'],
  'case-converter': ['camelcase', 'snake_case', 'kebab', 'title case', 'uppercase', 'lowercase'],
  'line-tools': ['sort', 'dedupe', 'unique', 'reverse', 'shuffle', 'trim', 'lines'],
  encrypt: ['aes', 'decrypt', 'password', 'cipher', 'secret', 'encryption'],
  totp: ['2fa', 'mfa', 'otp', 'authenticator', 'two factor', 'one time password'],
  hmac: ['signature', 'sign', 'sha', 'keyed hash', 'mac'],
  timestamp: ['unix', 'epoch', 'date', 'time', 'iso', 'utc'],
  'csv-json': ['csv', 'json', 'convert', 'spreadsheet', 'table', 'parse'],
  'unit-converter': ['length', 'weight', 'temperature', 'metric', 'imperial', 'convert', 'celsius'],
  percentage: ['percent', 'tip', 'discount', 'change', 'split', 'calculator'],
  'word-count': ['characters', 'words', 'count', 'reading time', 'letters'],
  slugify: ['slug', 'url', 'permalink', 'kebab', 'seo'],
  contrast: ['wcag', 'accessibility', 'a11y', 'ratio', 'color', 'luminance'],
  qr: ['qrcode', 'barcode', 'scan', 'link', 'url'],
  markdown: ['md', 'markdown', 'preview', 'editor', 'readme'],
};

/** Tools grouped by category, in display order (skips empty categories). */
export function toolsByCategory(): { category: ToolCategory; tools: Tool[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    tools: TOOLS.filter((tool) => tool.category === category),
  })).filter((group) => group.tools.length > 0);
}

/** Case-insensitive search over name, description, category, and keywords. */
export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return TOOLS;
  return TOOLS.filter((tool) => {
    const keywords = (TOOL_KEYWORDS[tool.id] ?? []).join(' ');
    return `${tool.name} ${tool.description} ${tool.category} ${keywords}`
      .toLowerCase()
      .includes(q);
  });
}

/** Only the tools that are actually usable now. */
export const LIVE_TOOLS = TOOLS.filter((tool) => tool.status === 'live');
