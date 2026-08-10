import type { Tool } from './registry';

/**
 * Optional, deliberately authored landing-page content. A tool only renders a
 * walkthrough, highlights, or FAQs when its entry contains specific guidance;
 * empty sections are preferable to generic marketing and repeated privacy copy.
 */

export interface ToolStep {
  title: string;
  body: string;
}

export interface ToolHighlight {
  title: string;
  body: string;
}

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolContent {
  /** Hero sub-headline. Defaults to the registry description. */
  tagline: string;
  steps: ToolStep[];
  highlights: ToolHighlight[];
  faqs: ToolFaq[];
}

// --- Bespoke content for tools that benefit from extra guidance ----------

const BESPOKE: Record<string, Partial<ToolContent>> = {
  'text-diff': {
    tagline: 'Compare two texts in a unified or side-by-side code-review view.',
    steps: [
      {
        title: 'Paste both versions',
        body: 'Put the original on the left and the changed text on the right, or swap them with one click.',
      },
      {
        title: 'Choose a view',
        body: 'Review additions and removals in one unified list or as aligned, side-by-side lines with line numbers.',
      },
      {
        title: 'Review the changes',
        body: 'See added, removed and unchanged line counts instantly. Everything stays in your browser.',
      },
    ],
  },
  optimize: {
    tagline: 'Shrink JPEG file size in your browser without a visible drop in quality.',
    steps: [
      {
        title: 'Add your image',
        body: 'Drop a JPEG in, pick one from your device, or paste from the clipboard. You can queue several at once.',
      },
      {
        title: 'Tune the quality',
        body: 'Pick a compression level and preview the new file size live. A balanced default keeps images crisp while cutting weight.',
      },
      {
        title: 'Download or ZIP',
        body: 'Save each optimised image, or download the whole batch as a single ZIP — all generated on your device.',
      },
    ],
    highlights: [
      {
        title: 'Smaller files, faster stores',
        body: 'Lighter product photos mean faster-loading pages and better conversion — without paying for an image CDN.',
      },
      {
        title: 'Quality you control',
        body: 'A live size read-out lets you trade a few kilobytes for sharpness exactly where you want the line.',
      },
      {
        title: 'Batch in one go',
        body: 'Optimise a whole set of images at once and export them together as a ZIP.',
      },
    ],
    faqs: [
      {
        q: 'Will compressing reduce image quality?',
        a: 'Only as much as you allow. At the balanced default the difference is hard to see, while the file gets substantially smaller. Turn quality up for near-lossless results, or down to save more.',
      },
      {
        q: 'What formats can I compress?',
        a: 'This tool focuses on JPEG, the best format for photographic product images. To change format, use the Convert image tool first.',
      },
      {
        q: 'Can I optimise many images at once?',
        a: 'Yes. Add several images and download them individually or as a single ZIP archive.',
      },
    ],
  },
  crop: {
    tagline: 'Frame and crop a product image to the exact aspect ratio you need.',
    steps: [
      {
        title: 'Add your image',
        body: 'Drop in, choose a file, or paste from the clipboard. The crop box appears centred and ready.',
      },
      {
        title: 'Frame the crop',
        body: 'Drag the box and handles, pick an aspect-ratio preset (1:1, 4:5, 16:9…), and zoom in for precise edges.',
      },
      {
        title: 'Export at the right size',
        body: 'Choose an export size and download. The crop is computed in full-resolution source pixels, so it stays sharp.',
      },
    ],
    highlights: [
      {
        title: 'Marketplace-ready ratios',
        body: 'Preset ratios cover the common storefront and social sizes so your images fit their slots without letterboxing.',
      },
      {
        title: 'Pixel-precise framing',
        body: 'Zoom the workspace and nudge with the arrow keys to place the crop exactly where you want it.',
      },
      {
        title: 'No quality loss',
        body: 'Cropping works on the original pixels, so the output is as sharp as the image you started with.',
      },
    ],
    faqs: [
      {
        q: 'Which aspect ratios can I crop to?',
        a: 'Free-form, plus presets for 1:1, 4:5, 4:3 and 16:9. Pick a preset to lock the ratio while you frame.',
      },
      {
        q: 'Does cropping reduce quality?',
        a: 'No. The crop is taken from the original image data, so the result keeps the sharpness of the source.',
      },
      {
        q: 'Can I set the exact output size?',
        a: 'Yes. Choose an export size (by longest edge) to scale the crop down to the dimensions you need.',
      },
    ],
  },
  resize: {
    tagline: 'Change an image to exact pixel dimensions, right in your browser.',
    steps: [
      {
        title: 'Add your image',
        body: 'Drop in or choose a file. Its current dimensions are shown so you know your starting point.',
      },
      {
        title: 'Set the size',
        body: 'Enter a width or height. Keep the aspect ratio locked to avoid stretching, or set both for an exact box.',
      },
      {
        title: 'Download',
        body: 'Export the resized image instantly — all processing happens on your device.',
      },
    ],
    faqs: [
      {
        q: 'Will resizing stretch my image?',
        a: 'Not if you keep the aspect ratio locked — set one dimension and the other follows proportionally.',
      },
      {
        q: 'Can I enlarge an image?',
        a: 'You can, though enlarging a small image past its native size will soften detail, as with any resize.',
      },
    ],
  },
  convert: {
    tagline: 'Convert images between JPG, PNG and WebP without leaving your browser.',
    steps: [
      {
        title: 'Add your image',
        body: 'Drop in or choose a file in any supported format.',
      },
      {
        title: 'Pick the target format',
        body: 'Choose JPG, PNG or WebP. WebP gives the smallest files; PNG preserves transparency.',
      },
      {
        title: 'Download',
        body: 'Save the converted file straight away — the conversion happens on your device.',
      },
    ],
    faqs: [
      {
        q: 'Which formats are supported?',
        a: 'Convert between JPG, PNG and WebP. WebP is best for the web; PNG keeps transparency; JPG is universally compatible.',
      },
      {
        q: 'Does converting lose quality?',
        a: 'Converting to a lossless format (PNG) preserves detail. Converting to JPG or WebP applies compression, which you can keep high for near-lossless output.',
      },
    ],
  },
  rotate: {
    tagline: 'Rotate or flip an image in any direction, locally in your browser.',
    steps: [
      { title: 'Add your image', body: 'Drop in or choose a file to get started.' },
      {
        title: 'Rotate or flip',
        body: 'Turn the image 90° at a time in either direction, or mirror it horizontally or vertically.',
      },
      { title: 'Download', body: 'Save the corrected image — nothing is uploaded to a server.' },
    ],
    faqs: [
      {
        q: 'Does rotating re-compress the image?',
        a: 'Rotating and flipping redraw the image on a canvas. Keep the quality high on export for a near-lossless result.',
      },
    ],
  },
  qr: {
    tagline: 'Generate a crisp QR code for any link or text in seconds.',
    steps: [
      { title: 'Enter your content', body: 'Type or paste a URL, text, or any short data.' },
      {
        title: 'Preview instantly',
        body: 'The QR code updates live as you type, so you can check it right away.',
      },
      {
        title: 'Download',
        body: 'Save the QR code as an image, ready to print or share.',
      },
    ],
    faqs: [
      {
        q: 'Do the QR codes expire?',
        a: 'No. The code encodes your content directly, so it works forever and needs no tracking service.',
      },
    ],
  },
  favicon: {
    tagline: 'Turn any image into a set of favicons for your website.',
    steps: [
      { title: 'Add an image', body: 'Choose a square logo or icon for the best result.' },
      {
        title: 'Generate the sizes',
        body: 'The tool produces the common favicon sizes browsers and devices expect.',
      },
      {
        title: 'Download',
        body: 'Save the icons and drop them into your site — all done locally.',
      },
    ],
    faqs: [
      {
        q: 'What image should I use?',
        a: 'A square image with clear, simple shapes works best, since favicons are shown very small.',
      },
    ],
  },
  'images-to-pdf': {
    tagline: 'Combine several images into a single PDF, without uploading anything.',
    steps: [
      { title: 'Add your images', body: 'Drop in or choose the images you want to combine.' },
      {
        title: 'Arrange the order',
        body: 'Reorder the pages so they appear in the sequence you want.',
      },
      {
        title: 'Download the PDF',
        body: 'Export a single PDF, assembled entirely on your device.',
      },
    ],
    faqs: [
      {
        q: 'Can I control the page order?',
        a: 'Yes. Reorder the images before exporting and each becomes a page in that order.',
      },
    ],
  },
  'accessibility-checker': {
    tagline:
      'See how a public website behaves without a mouse, then download the evidence needed to investigate and fix it.',
    steps: [
      {
        title: 'Enter a public URL',
        body: 'Choose a safe or fuller ecommerce journey and the number of clean repetitions. Private and local network targets are blocked.',
      },
      {
        title: 'Reproduce the experience',
        body: 'An isolated browser follows keyboard focus, exercises search and common controls, and runs structural accessibility rules.',
      },
      {
        title: 'Review and compare evidence',
        body: 'Inspect findings, standards mappings, selectors and screenshots, then download portable JSON for regression comparison.',
      },
    ],
    highlights: [
      {
        title: 'Behavior, not only markup',
        body: 'The audit combines automated rules with real Tab, Shift+Tab, Escape, focus-order and interaction journeys.',
      },
      {
        title: 'Evidence strength stays explicit',
        body: 'Confirmed, Likely and Review separate direct observations from signals that still require human judgment.',
      },
      {
        title: 'Mapped, not legally certified',
        body: 'Findings connect to WCAG, ADA, EAA, Section 508 and AODA while clearly preserving the limits of automation.',
      },
    ],
    faqs: [
      {
        q: 'Does this prove that a website is compliant?',
        a: 'No. It gathers repeatable evidence and maps relevant requirements, but it is not legal advice or certification. Human testing with assistive technology remains necessary.',
      },
      {
        q: 'Why is this tool server-assisted?',
        a: 'A normal browser tab cannot inspect an unrelated website because of same-origin security rules. The submitted public URL is therefore opened in an isolated Playwright browser on the Toolkit runner.',
      },
      {
        q: 'Are reports saved permanently?',
        a: 'No permanent report library is maintained. Runtime artifacts expire automatically; download the portable JSON report if you need to retain or compare it.',
      },
    ],
  },
};

export function getToolContent(tool: Tool): ToolContent {
  const bespoke = BESPOKE[tool.id] ?? {};
  return {
    tagline: bespoke.tagline ?? tool.description,
    steps: bespoke.steps ?? [],
    highlights: bespoke.highlights ?? [],
    faqs: bespoke.faqs ?? [],
  };
}
