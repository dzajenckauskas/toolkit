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
    status: 'planned',
  },
  {
    id: 'convert',
    name: 'Convert image',
    description: 'Convert between JPG, PNG, WebP and more.',
    href: '/convert',
    category: 'Images & Media',
    status: 'planned',
  },
  {
    id: 'rotate',
    name: 'Rotate & flip',
    description: 'Rotate or flip an image any direction.',
    href: '/rotate',
    category: 'Images & Media',
    status: 'planned',
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
    status: 'planned',
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
    status: 'planned',
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
    description: 'Markdown editor with live preview and export.',
    href: '/markdown',
    category: 'Text & Documents',
    status: 'planned',
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
    status: 'planned',
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum',
    description: 'Generate placeholder text for layouts.',
    href: '/lorem-ipsum',
    category: 'Text & Documents',
    status: 'planned',
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
    description: 'Validate and format JSON.',
    href: '/json',
    category: 'Developer',
    status: 'planned',
  },
  {
    id: 'jwt',
    name: 'JWT',
    description: 'Decode and inspect JSON Web Tokens.',
    href: '/jwt',
    category: 'Developer',
    status: 'planned',
  },
  {
    id: 'regex',
    name: 'Regex tester',
    description: 'Test regular expressions live.',
    href: '/regex',
    category: 'Developer',
    status: 'planned',
  },
  {
    id: 'base64',
    name: 'Base64',
    description: 'Encode and decode Base64.',
    href: '/base64',
    category: 'Developer',
    status: 'planned',
  },
  {
    id: 'hash',
    name: 'Hash generator',
    description: 'Generate SHA / MD5 hashes.',
    href: '/hash',
    category: 'Developer',
    status: 'planned',
  },
  {
    id: 'checksum',
    name: 'File checksum verifier',
    description: 'Verify a file against a checksum.',
    href: '/checksum',
    category: 'Developer',
    status: 'planned',
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
    status: 'planned',
  },

  // Design
  {
    id: 'colors',
    name: 'Colors',
    description: 'Pick, convert and build color palettes.',
    href: '/colors',
    category: 'Design',
    status: 'planned',
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
    status: 'planned',
  },

  // Productivity
  {
    id: 'focus-timer',
    name: 'Focus timer',
    description: 'A simple Pomodoro-style timer.',
    href: '/focus-timer',
    category: 'Productivity',
    status: 'planned',
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
    status: 'planned',
  },
];

/** Tools grouped by category, in display order (skips empty categories). */
export function toolsByCategory(): { category: ToolCategory; tools: Tool[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    tools: TOOLS.filter((tool) => tool.category === category),
  })).filter((group) => group.tools.length > 0);
}

/** Case-insensitive search over tool name, description, and category. */
export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return TOOLS;
  return TOOLS.filter((tool) =>
    `${tool.name} ${tool.description} ${tool.category}`.toLowerCase().includes(q),
  );
}

/** Only the tools that are actually usable now. */
export const LIVE_TOOLS = TOOLS.filter((tool) => tool.status === 'live');
