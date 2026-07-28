import type { Tool } from './registry';

/**
 * Per-tool landing-page content: the "how it works" steps, the highlight cards,
 * and the FAQ shown on each tool page. Flagship tools get bespoke copy; every
 * other tool falls back to sensible content derived from its registry entry, so
 * every page is complete without hand-authoring all of them.
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

// --- Generic fallbacks, derived from the registry entry ------------------

function genericSteps(tool: Tool): ToolStep[] {
  return [
    {
      title: 'Open it in your browser',
      body: `${tool.name} runs entirely on your device — no upload, no account, and nothing to install.`,
    },
    {
      title: 'Do the work',
      body: `${tool.description} Everything happens instantly as you go.`,
    },
    {
      title: 'Save your result',
      body: 'Download or copy the output straight away. Your data never leaves your device.',
    },
  ];
}

function genericHighlights(tool: Tool): ToolHighlight[] {
  return [
    {
      title: 'Completely private',
      body: `${tool.name} works locally in your browser — your files and text are never sent to a server.`,
    },
    {
      title: 'Free, with no account',
      body: 'No sign-up, no trial, and no usage limits. Open the tool and start straight away.',
    },
    {
      title: 'Works on any device',
      body: 'Runs in any modern browser on desktop, tablet or phone — nothing to download.',
    },
  ];
}

function genericFaqs(tool: Tool): ToolFaq[] {
  return [
    {
      q: `Is ${tool.name} free to use?`,
      a: 'Yes — every tool here is completely free, with no account, sign-up, or usage limits.',
    },
    {
      q: 'Is anything uploaded to a server?',
      a: `No. ${tool.name} runs entirely in your browser, so your data never leaves your device.`,
    },
    {
      q: 'Do I need to install anything?',
      a: 'No. It works in any modern browser on desktop or mobile — there is nothing to download or install.',
    },
    {
      q: 'Does it work offline?',
      a: 'Once the page has loaded, the processing happens locally, so it keeps working even on a flaky connection.',
    },
  ];
}

// --- Bespoke content for flagship tools ----------------------------------

const BESPOKE: Record<string, Partial<ToolContent>> = {
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
        q: 'Are my photos uploaded anywhere?',
        a: 'No. Compression runs entirely in your browser using the Canvas API — your images never leave your device.',
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
      {
        q: 'Is anything uploaded?',
        a: 'No. Resizing runs locally in your browser; your image never leaves your device.',
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
      {
        q: 'Are my files uploaded?',
        a: 'No — conversion runs entirely in your browser, so nothing is sent to a server.',
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
      {
        q: 'Is anything uploaded?',
        a: 'No. Everything runs in your browser; your image never leaves your device.',
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
      {
        q: 'Is my data sent anywhere?',
        a: 'No. The QR code is generated in your browser — the content you enter never leaves your device.',
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
      {
        q: 'Is my image uploaded?',
        a: 'No. The favicons are generated in your browser; your image never leaves your device.',
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
      {
        q: 'Are my images uploaded?',
        a: 'No. The PDF is built in your browser, so your images never leave your device.',
      },
    ],
  },
};

export function getToolContent(tool: Tool): ToolContent {
  const bespoke = BESPOKE[tool.id] ?? {};
  return {
    tagline: bespoke.tagline ?? tool.description,
    steps: bespoke.steps ?? genericSteps(tool),
    highlights: bespoke.highlights ?? genericHighlights(tool),
    faqs: bespoke.faqs ?? genericFaqs(tool),
  };
}
