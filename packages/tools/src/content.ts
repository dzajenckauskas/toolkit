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
  /** Hero sub-headline (visible on the page). Defaults to the registry description. */
  tagline: string;
  steps: ToolStep[];
  highlights: ToolHighlight[];
  faqs: ToolFaq[];
  /**
   * Search-optimized `<title>` lead — the keyword-rich phrase before the brand
   * suffix, decoupled from the short catalog `name` so the title tag can target
   * real queries while the card and H1 stay concise. The page appends the brand.
   */
  seoTitle?: string;
  /** Search-optimized meta description (~150 chars, keyword + benefit + CTR). */
  seoDescription?: string;
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

  // --- Images & Media ----------------------------------------------------
  'image-editor': {
    tagline: 'Compress, resize, crop, rotate and convert an image in one place.',
    steps: [
      {
        title: 'Add your image',
        body: 'Drop in, choose a file, or paste from the clipboard to start editing.',
      },
      {
        title: 'Make your edits',
        body: 'Crop and rotate, resize to exact pixels, convert the format, and compress — switch between tools without re-uploading.',
      },
      {
        title: 'Download',
        body: 'Export the finished image. Every step runs on your device, so nothing is uploaded.',
      },
    ],
    faqs: [
      {
        q: 'Do I have to do the edits in order?',
        a: 'No. Apply crop, resize, rotate, convert and compress in whatever order suits the image — the result updates as you go.',
      },
      {
        q: 'Are my images uploaded anywhere?',
        a: 'No. The editor works entirely in your browser, so your images never leave your device.',
      },
    ],
  },
  screenshot: {
    tagline: 'Wrap a screenshot in padding, a background and a soft shadow.',
    steps: [
      {
        title: 'Add a screenshot',
        body: 'Drop in or paste an image — a raw screen grab works fine.',
      },
      {
        title: 'Style the frame',
        body: 'Pick a background, add padding and rounded corners, and drop in a shadow to give it depth.',
      },
      {
        title: 'Download',
        body: 'Export the polished image, ready for a slide, a README or social.',
      },
    ],
    faqs: [
      {
        q: 'What is this useful for?',
        a: 'Plain screenshots look flat in presentations and posts. A little padding, a background and a shadow make them read as a deliberate visual.',
      },
      {
        q: 'Is anything uploaded?',
        a: 'No. The beautifier runs locally in your browser; your screenshots stay on your device.',
      },
    ],
  },

  // --- Text & Documents --------------------------------------------------
  markdown: {
    tagline: 'Write Markdown with a live preview beside your text.',
    steps: [
      {
        title: 'Type Markdown',
        body: 'Write in the editor using headings, lists, links, code blocks and tables.',
      },
      {
        title: 'See it rendered',
        body: 'The preview updates live as you type, so you always see the formatted result.',
      },
      {
        title: 'Copy or keep writing',
        body: 'Copy the Markdown or the rendered output — nothing is saved to a server.',
      },
    ],
    faqs: [
      {
        q: 'Which Markdown syntax is supported?',
        a: 'The common CommonMark elements — headings, bold and italic, lists, links, images, blockquotes, code blocks and tables.',
      },
      {
        q: 'Is my text uploaded?',
        a: 'No. The editor and preview run entirely in your browser.',
      },
    ],
  },
  'lorem-ipsum': {
    tagline: 'Generate placeholder text to fill a layout or mockup.',
    steps: [
      {
        title: 'Choose how much',
        body: 'Pick the number of paragraphs, sentences or words you need.',
      },
      {
        title: 'Generate',
        body: 'Placeholder text appears instantly, ready to drop into your design.',
      },
      { title: 'Copy', body: 'Copy the text and paste it wherever you need filler content.' },
    ],
    faqs: [
      {
        q: 'What is Lorem Ipsum?',
        a: 'It is scrambled Latin-like filler text used since the 1500s to show how a layout reads before the real copy is ready — its even word lengths avoid distracting from the design.',
      },
      {
        q: 'Can I choose the amount?',
        a: 'Yes. Generate by paragraphs, sentences or a specific word count to match the space you are filling.',
      },
    ],
  },
  'case-converter': {
    tagline: 'Convert text between camelCase, snake_case, Title Case and more.',
    steps: [
      {
        title: 'Paste your text',
        body: 'Drop in a word, a variable name, or a whole block of text.',
      },
      {
        title: 'Pick a case',
        body: 'Convert to camelCase, PascalCase, snake_case, kebab-case, UPPER, lower, Title Case or Sentence case.',
      },
      {
        title: 'Copy the result',
        body: 'Copy the converted text — it all happens in your browser.',
      },
    ],
    faqs: [
      {
        q: 'Which cases can I convert to?',
        a: 'camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case, Sentence case, UPPERCASE and lowercase.',
      },
      {
        q: 'Does it handle whole sentences?',
        a: 'Yes. Convert a single identifier or a full paragraph — the tool splits on spaces, underscores, hyphens and case boundaries.',
      },
    ],
  },
  'line-tools': {
    tagline: 'Sort, de-duplicate, reverse and clean lines of text.',
    steps: [
      { title: 'Paste your lines', body: 'Drop in a list — one item per line.' },
      {
        title: 'Apply an operation',
        body: 'Sort alphabetically, remove duplicates, reverse the order, shuffle, or trim blank lines and whitespace.',
      },
      {
        title: 'Copy the result',
        body: 'Copy the cleaned list back out — nothing leaves your browser.',
      },
    ],
    faqs: [
      {
        q: 'What can it do to my lines?',
        a: 'Sort (A–Z or Z–A), remove duplicate lines, reverse or shuffle the order, and strip empty lines and surrounding whitespace.',
      },
      {
        q: 'Is my list uploaded?',
        a: 'No. Every operation runs locally in your browser.',
      },
    ],
  },
  'word-count': {
    tagline: 'Count words, characters, sentences and reading time as you type.',
    steps: [
      { title: 'Paste or type', body: 'Drop in your text and the counts update live.' },
      {
        title: 'Read the stats',
        body: 'See words, characters (with and without spaces), sentences, paragraphs and an estimated reading time.',
      },
      {
        title: 'Write to a limit',
        body: 'Watch the counts as you edit to hit a word or character target.',
      },
    ],
    faqs: [
      {
        q: 'How is reading time estimated?',
        a: 'From the word count, using a typical adult reading speed of around 200–250 words per minute.',
      },
      {
        q: 'Does it count characters with and without spaces?',
        a: 'Yes. Both are shown, which is handy for platforms that limit either one.',
      },
    ],
  },
  slugify: {
    tagline: 'Turn a title into a clean, URL-safe slug.',
    steps: [
      { title: 'Enter your text', body: 'Type or paste a title, heading or phrase.' },
      {
        title: 'Get the slug',
        body: 'Spaces become hyphens, accents are simplified and unsafe characters are dropped — instantly.',
      },
      { title: 'Copy', body: 'Copy the slug into your URL, filename or anchor.' },
    ],
    faqs: [
      {
        q: 'What is a slug?',
        a: 'The readable, hyphenated part of a URL — for example, “my-first-post”. Clean slugs are easier to read and share, and help search engines understand a page.',
      },
      {
        q: 'How are accents and symbols handled?',
        a: 'Accented letters are simplified to their closest ASCII form and characters that are not URL-safe are removed, leaving lowercase words joined by hyphens.',
      },
    ],
  },

  // --- Developer ---------------------------------------------------------
  json: {
    tagline: 'Validate, format and minify JSON in your browser.',
    steps: [
      {
        title: 'Paste your JSON',
        body: 'Drop in JSON from an API response, a config file or anywhere else.',
      },
      {
        title: 'Format or minify',
        body: 'Pretty-print with clean indentation for reading, or minify to the smallest valid string.',
      },
      {
        title: 'Fix and copy',
        body: 'Errors point to the line and position so you can fix them, then copy the result.',
      },
    ],
    highlights: [
      {
        title: 'Clear error messages',
        body: 'Invalid JSON is flagged with the position of the problem, so you can find a stray comma or bracket fast.',
      },
      {
        title: 'Readable or compact',
        body: 'Switch between pretty-printed and minified output depending on whether you are debugging or shipping.',
      },
      {
        title: 'Stays on your device',
        body: 'Paste sensitive payloads without worry — nothing is uploaded or logged.',
      },
    ],
    faqs: [
      {
        q: 'Is my JSON sent to a server?',
        a: 'No. Validation, formatting and minifying all happen in your browser, so even sensitive data stays local.',
      },
      {
        q: 'Why does it say my JSON is invalid?',
        a: 'Common causes are trailing commas, single quotes instead of double quotes, or unquoted keys. The error points to where parsing failed so you can fix it.',
      },
      {
        q: 'What is the difference between formatting and minifying?',
        a: 'Formatting adds indentation and line breaks so JSON is easy to read; minifying strips all optional whitespace to make the smallest valid payload.',
      },
    ],
  },
  jwt: {
    tagline: 'Decode, inspect and sign JSON Web Tokens locally.',
    steps: [
      {
        title: 'Paste a token',
        body: 'Drop in a JWT to split it into its header, payload and signature.',
      },
      {
        title: 'Inspect the claims',
        body: 'Read the decoded header and payload, including standard claims like issuer, subject and expiry.',
      },
      {
        title: 'Sign or verify',
        body: 'Provide a secret to sign a new token or check an existing signature — all in your browser.',
      },
    ],
    highlights: [
      {
        title: 'Nothing leaves the page',
        body: 'Tokens often carry sensitive claims. Here they are decoded and signed locally, never sent to a server.',
      },
      {
        title: 'Human-readable claims',
        body: 'Timestamps like exp and iat are shown so you can see at a glance whether a token has expired.',
      },
      {
        title: 'Sign and verify',
        body: 'Test your auth flow by minting tokens with a secret and verifying signatures without leaving the browser.',
      },
    ],
    faqs: [
      {
        q: 'Is it safe to paste a real token here?',
        a: 'Yes. Everything runs in your browser — the token and any secret you enter are never uploaded. Still, treat production secrets with care on any shared machine.',
      },
      {
        q: 'Can I tell if a token has expired?',
        a: 'Yes. The decoded payload shows the exp claim as a readable date, so you can see whether it is still valid.',
      },
      {
        q: 'Which algorithms are supported for signing?',
        a: 'HMAC signing (HS256 and friends) with a shared secret, which covers the most common JWT use.',
      },
    ],
  },
  regex: {
    tagline: 'Test regular expressions live against your own text.',
    steps: [
      {
        title: 'Write a pattern',
        body: 'Enter your regular expression and toggle flags like global, case-insensitive and multiline.',
      },
      { title: 'Add test text', body: 'Paste the text to search — matches highlight as you type.' },
      {
        title: 'Inspect matches',
        body: 'See every match and captured group so you can refine the pattern.',
      },
    ],
    highlights: [
      {
        title: 'Instant feedback',
        body: 'Matches highlight live as you edit the pattern, so you can iterate quickly instead of guessing.',
      },
      {
        title: 'Capture groups spelled out',
        body: 'Each match lists its captured groups, making it easy to see what your parentheses actually grab.',
      },
      {
        title: 'Runs locally',
        body: 'Your patterns and test data stay in the browser — nothing is uploaded.',
      },
    ],
    faqs: [
      {
        q: 'Which regex flavour does it use?',
        a: 'JavaScript regular expressions, so patterns behave the same as they would in browser or Node.js code.',
      },
      {
        q: 'Which flags can I set?',
        a: 'The usual ones — global (g), case-insensitive (i), multiline (m), dotall (s), unicode (u) and sticky (y).',
      },
    ],
  },
  base64: {
    tagline: 'Encode text to Base64 and decode it back, instantly.',
    steps: [
      {
        title: 'Enter your input',
        body: 'Type or paste text to encode, or a Base64 string to decode.',
      },
      {
        title: 'Pick a direction',
        body: 'Switch between encode and decode — the output updates as you type.',
      },
      {
        title: 'Copy the result',
        body: 'Copy the encoded or decoded text; it never leaves your browser.',
      },
    ],
    highlights: [
      {
        title: 'Both directions',
        body: 'Encode plain text to Base64 or decode a Base64 string back to readable text in one place.',
      },
      {
        title: 'Unicode-safe',
        body: 'Handles accented and non-Latin characters correctly, so decoded text comes back intact.',
      },
      {
        title: 'Private by default',
        body: 'Encoding and decoding run locally, so you can paste sensitive strings safely.',
      },
    ],
    faqs: [
      {
        q: 'Is Base64 encryption?',
        a: 'No. Base64 is an encoding, not encryption — anyone can decode it. It is used to represent binary or text safely in places that expect plain ASCII, not to keep data secret.',
      },
      {
        q: 'Does it handle emoji and accents?',
        a: 'Yes. Input is treated as UTF-8, so non-Latin characters and emoji encode and decode without corruption.',
      },
    ],
  },
  hash: {
    tagline: 'Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes from text.',
    steps: [
      { title: 'Enter your text', body: 'Type or paste the text you want to hash.' },
      {
        title: 'Read the digests',
        body: 'Hashes for each algorithm are computed live as you type.',
      },
      { title: 'Copy a hash', body: 'Copy the digest you need — everything runs in your browser.' },
    ],
    highlights: [
      {
        title: 'Multiple algorithms at once',
        body: 'See SHA-1, SHA-256, SHA-384 and SHA-512 side by side without switching modes.',
      },
      {
        title: 'Web Crypto under the hood',
        body: 'Digests come from the browser’s built-in, audited Web Crypto API — fast and reliable.',
      },
      {
        title: 'Input stays local',
        body: 'Your text is hashed on your device and never uploaded.',
      },
    ],
    faqs: [
      {
        q: 'Can I get the original text back from a hash?',
        a: 'No. Hashing is one-way by design — the same input always produces the same digest, but you cannot reverse it to recover the input.',
      },
      {
        q: 'Should I use SHA-1?',
        a: 'Prefer SHA-256 or stronger for anything security-sensitive. SHA-1 is included for compatibility but is considered weak against collision attacks.',
      },
    ],
  },
  checksum: {
    tagline: 'Verify a file against a checksum, right in your browser.',
    steps: [
      { title: 'Choose a file', body: 'Select the downloaded file you want to check.' },
      {
        title: 'Read its hash',
        body: 'The tool computes the file’s SHA hash locally, without uploading it.',
      },
      { title: 'Compare', body: 'Paste the expected checksum to confirm they match exactly.' },
    ],
    faqs: [
      {
        q: 'Why verify a checksum?',
        a: 'A matching checksum confirms a download arrived intact and was not corrupted or tampered with. A mismatch means the file differs from the one the publisher hashed.',
      },
      {
        q: 'Is my file uploaded to check it?',
        a: 'No. The file is read and hashed in your browser, so even large or private files never leave your device.',
      },
    ],
  },
  uuid: {
    tagline: 'Generate random version 4 UUIDs on demand.',
    steps: [
      { title: 'Generate', body: 'Get a fresh random UUID instantly, or ask for several at once.' },
      { title: 'Copy', body: 'Copy a single UUID or the whole batch to your clipboard.' },
      { title: 'Repeat', body: 'Generate as many as you need — each one is unique.' },
    ],
    highlights: [
      {
        title: 'Cryptographically random',
        body: 'UUIDs are generated with the browser’s secure random source, so collisions are astronomically unlikely.',
      },
      {
        title: 'Single or batch',
        body: 'Grab one identifier or generate a list to seed a database or test fixtures.',
      },
      {
        title: 'No network needed',
        body: 'Everything is generated locally — useful even offline.',
      },
    ],
    faqs: [
      {
        q: 'What is a v4 UUID?',
        a: 'A 128-bit identifier whose bits are almost entirely random. It is the most common UUID type when you just need a unique id and do not need it to encode a timestamp or MAC address.',
      },
      {
        q: 'Are the UUIDs really unique?',
        a: 'In practice, yes. With 122 random bits the chance of ever generating the same v4 UUID twice is negligible.',
      },
    ],
  },
  password: {
    tagline: 'Generate strong, random passwords in your browser.',
    steps: [
      {
        title: 'Set the rules',
        body: 'Choose the length and which character sets to include — uppercase, lowercase, numbers and symbols.',
      },
      {
        title: 'Generate',
        body: 'A random password is created instantly using a secure random source.',
      },
      { title: 'Copy', body: 'Copy the password straight into your password manager.' },
    ],
    highlights: [
      {
        title: 'Secure randomness',
        body: 'Passwords use the browser’s cryptographic random generator, not a predictable pseudo-random one.',
      },
      {
        title: 'You set the strength',
        body: 'Tune length and character sets to meet any site’s requirements while keeping entropy high.',
      },
      {
        title: 'Never leaves your device',
        body: 'Generated passwords are created locally and are never transmitted, stored or logged.',
      },
    ],
    faqs: [
      {
        q: 'Are these passwords safe to use?',
        a: 'Yes. They are generated locally with a cryptographically secure random source and are never sent anywhere. For best results, store them in a password manager.',
      },
      {
        q: 'How long should a password be?',
        a: 'Longer is stronger. Aim for at least 16 characters with a mix of character types for accounts that matter.',
      },
    ],
  },
  'url-encode': {
    tagline: 'Percent-encode and decode URL components instantly.',
    steps: [
      {
        title: 'Paste your text',
        body: 'Enter a URL, a query-string value, or any text to encode or decode.',
      },
      {
        title: 'Choose a direction',
        body: 'Encode unsafe characters to percent-escapes, or decode them back.',
      },
      { title: 'Copy', body: 'Copy the result — it all runs in your browser.' },
    ],
    faqs: [
      {
        q: 'What does URL encoding do?',
        a: 'It replaces characters that are unsafe or reserved in a URL — spaces, &, ?, / and non-ASCII text — with percent-escapes like %20, so the value survives being placed in a link.',
      },
      {
        q: 'Should I encode a whole URL or just parts?',
        a: 'Usually just the parts — a query value or path segment. Encoding a whole URL escapes the : and / that make it work, so encode components individually.',
      },
    ],
  },
  'html-entities': {
    tagline: 'Escape and unescape HTML entities in your text.',
    steps: [
      {
        title: 'Paste your text',
        body: 'Enter text with characters like <, > and &, or text containing entities.',
      },
      {
        title: 'Escape or unescape',
        body: 'Convert reserved characters to entities, or turn entities back into characters.',
      },
      { title: 'Copy', body: 'Copy the safe output straight into your markup.' },
    ],
    faqs: [
      {
        q: 'Why escape HTML entities?',
        a: 'Characters like <, > and & have special meaning in HTML. Escaping them to &lt;, &gt; and &amp; lets you show them as text instead of having the browser treat them as markup.',
      },
      {
        q: 'Does it handle named and numeric entities?',
        a: 'Yes. Unescaping recognises both named entities like &amp; and numeric ones like &#38;.',
      },
    ],
  },
  'number-base': {
    tagline: 'Convert numbers between binary, octal, decimal and hexadecimal.',
    steps: [
      {
        title: 'Enter a number',
        body: 'Type a value in any base — binary, octal, decimal or hex.',
      },
      { title: 'See every base', body: 'The other representations update live as you type.' },
      { title: 'Copy', body: 'Copy the base you need for your code or calculation.' },
    ],
    faqs: [
      {
        q: 'Which bases are supported?',
        a: 'Binary (base 2), octal (base 8), decimal (base 10) and hexadecimal (base 16) — the bases developers reach for most.',
      },
      {
        q: 'Can I convert in both directions?',
        a: 'Yes. Enter a value in any base and the others are computed at once, so there is no separate “from” and “to”.',
      },
    ],
  },
  totp: {
    tagline: 'Generate two-factor (TOTP) codes from a shared secret.',
    steps: [
      {
        title: 'Enter your secret',
        body: 'Paste the Base32 secret from your authenticator setup.',
      },
      {
        title: 'Read the code',
        body: 'The current 6-digit code is shown with a countdown to the next one.',
      },
      {
        title: 'Use it',
        body: 'Enter the code to sign in — everything is computed in your browser.',
      },
    ],
    faqs: [
      {
        q: 'How does TOTP work?',
        a: 'A time-based one-time password combines your shared secret with the current 30-second time window to produce a short code that both sides can compute independently.',
      },
      {
        q: 'Is it safe to enter my 2FA secret here?',
        a: 'Codes are generated locally and the secret is never uploaded. That said, your TOTP secret is sensitive — only enter it on a device and machine you trust.',
      },
    ],
  },
  hmac: {
    tagline: 'Compute a keyed HMAC signature for a message.',
    steps: [
      { title: 'Enter the message', body: 'Paste the text you want to sign.' },
      {
        title: 'Add a key',
        body: 'Provide the secret key and choose the hash — SHA-256, SHA-384 or SHA-512.',
      },
      {
        title: 'Copy the signature',
        body: 'Copy the resulting HMAC digest, computed in your browser.',
      },
    ],
    faqs: [
      {
        q: 'What is an HMAC used for?',
        a: 'It proves a message came from someone who holds the shared secret key and was not altered in transit — commonly used for signing API requests and webhooks.',
      },
      {
        q: 'How is HMAC different from a plain hash?',
        a: 'A plain hash depends only on the message, so anyone can recompute it. An HMAC also mixes in a secret key, so only holders of the key can produce or verify it.',
      },
    ],
  },
  timestamp: {
    tagline: 'Convert between Unix timestamps and human-readable dates.',
    steps: [
      { title: 'Enter a value', body: 'Paste a Unix timestamp, or pick a date and time.' },
      {
        title: 'See both sides',
        body: 'The timestamp and the formatted date convert instantly, in UTC and your local time.',
      },
      { title: 'Copy', body: 'Copy the value you need for your logs or code.' },
    ],
    faqs: [
      {
        q: 'What is a Unix timestamp?',
        a: 'The number of seconds since 1 January 1970 (UTC). It is a compact, timezone-free way to store an instant in time that most systems understand.',
      },
      {
        q: 'Does it handle seconds and milliseconds?',
        a: 'Yes. It recognises both second- and millisecond-precision timestamps, which is handy since JavaScript uses milliseconds.',
      },
    ],
  },
  'csv-json': {
    tagline: 'Convert between CSV and JSON in either direction.',
    steps: [
      {
        title: 'Paste your data',
        body: 'Drop in CSV with a header row, or an array of JSON objects.',
      },
      {
        title: 'Convert',
        body: 'CSV becomes JSON objects keyed by the header, and JSON becomes rows and columns.',
      },
      { title: 'Copy the result', body: 'Copy the converted data — nothing is uploaded.' },
    ],
    faqs: [
      {
        q: 'Does the CSV need a header row?',
        a: 'For CSV to JSON, yes — the first row’s column names become the keys of each JSON object.',
      },
      {
        q: 'How are commas and quotes inside values handled?',
        a: 'Standard CSV quoting is respected, so values wrapped in double quotes can safely contain commas, quotes and line breaks.',
      },
    ],
  },

  // --- Design ------------------------------------------------------------
  colors: {
    tagline: 'Convert a color between HEX, RGB and HSL.',
    steps: [
      {
        title: 'Enter a color',
        body: 'Type a HEX, RGB or HSL value, or pick one with the color picker.',
      },
      {
        title: 'See every format',
        body: 'The other formats update live, so you can copy whichever your code needs.',
      },
      { title: 'Copy', body: 'Copy the value in the format you want.' },
    ],
    faqs: [
      {
        q: 'Which color formats are supported?',
        a: 'HEX, RGB and HSL — the three you reach for most in CSS. Enter any one and the others are computed instantly.',
      },
      {
        q: 'Does it support alpha transparency?',
        a: 'Yes. Colors with an alpha channel convert between their HEX, RGB and HSL forms with the opacity preserved.',
      },
    ],
  },
  contrast: {
    tagline: 'Check color contrast against the WCAG AA and AAA thresholds.',
    steps: [
      { title: 'Pick two colors', body: 'Choose a text color and a background color.' },
      {
        title: 'Read the ratio',
        body: 'The contrast ratio is shown with clear AA and AAA pass or fail marks.',
      },
      { title: 'Adjust', body: 'Tweak the colors until the pairing passes for your text size.' },
    ],
    highlights: [
      {
        title: 'AA and AAA at a glance',
        body: 'See exactly which WCAG levels a pairing passes for normal and large text, so accessibility is not guesswork.',
      },
      {
        title: 'Live ratio',
        body: 'The contrast ratio updates as you adjust either color, making it quick to find a compliant combination.',
      },
      {
        title: 'Design with confidence',
        body: 'Confirm your palette is readable before you ship it, not after an audit flags it.',
      },
    ],
    faqs: [
      {
        q: 'What contrast ratio do I need?',
        a: 'WCAG AA needs 4.5:1 for normal text and 3:1 for large text; AAA raises that to 7:1 and 4.5:1. Larger, bolder text is allowed a lower ratio.',
      },
      {
        q: 'What counts as large text?',
        a: 'Roughly 18pt (24px) normal weight, or 14pt (about 19px) bold. Large text qualifies for the more lenient thresholds.',
      },
    ],
  },
  palette: {
    tagline: 'Build harmonies, tints and shades from a single base color.',
    steps: [
      { title: 'Pick a base color', body: 'Enter a HEX value or choose one with the picker.' },
      {
        title: 'Explore harmonies',
        body: 'See complementary, analogous, triadic and other schemes, plus tints and shades.',
      },
      { title: 'Copy the swatches', body: 'Copy any color’s value straight into your design.' },
    ],
    faqs: [
      {
        q: 'What colour harmonies are included?',
        a: 'Complementary, analogous, triadic and similar schemes derived from color-wheel relationships, alongside lighter tints and darker shades of your base.',
      },
      {
        q: 'How do I use these in a design?',
        a: 'Use the base and its harmonies for primary and accent colors, and the tints and shades for hover states, backgrounds and borders.',
      },
    ],
  },
  gradient: {
    tagline: 'Build linear and radial CSS gradients visually.',
    steps: [
      {
        title: 'Add color stops',
        body: 'Choose two or more colors and position them along the gradient.',
      },
      { title: 'Shape it', body: 'Switch between linear and radial, and set the angle or centre.' },
      {
        title: 'Copy the CSS',
        body: 'Copy the ready-to-use background gradient into your stylesheet.',
      },
    ],
    faqs: [
      {
        q: 'Does it output ready-to-use CSS?',
        a: 'Yes. The tool generates a complete background gradient value you can paste straight into your CSS.',
      },
      {
        q: 'Can I use more than two colors?',
        a: 'Yes. Add as many color stops as you like and position each one along the gradient.',
      },
    ],
  },
  'color-mixer': {
    tagline: 'Blend two colors and get the steps between them.',
    steps: [
      { title: 'Pick two colors', body: 'Choose a start and end color.' },
      {
        title: 'Set the steps',
        body: 'Choose how many intermediate colors to generate between them.',
      },
      { title: 'Copy the blend', body: 'Copy any step’s value for your gradient, chart or theme.' },
    ],
    faqs: [
      {
        q: 'What can I use the blended steps for?',
        a: 'Even color ramps are handy for data-visualisation scales, gradient stops, and generating consistent hover or shade variants between two brand colors.',
      },
      {
        q: 'How are the in-between colors calculated?',
        a: 'By interpolating evenly between the two colors, so each step is a proportional mix of the start and end.',
      },
    ],
  },
  blob: {
    tagline: 'Generate organic SVG blob shapes for your designs.',
    steps: [
      {
        title: 'Shape the blob',
        body: 'Adjust the complexity and randomness until you like the form.',
      },
      { title: 'Recolor', body: 'Set the fill color to match your design.' },
      { title: 'Copy the SVG', body: 'Copy the SVG markup or download it for use anywhere.' },
    ],
    faqs: [
      {
        q: 'What are blob shapes used for?',
        a: 'Soft, organic blobs are popular as background decoration, section dividers and image masks in modern web and app design.',
      },
      {
        q: 'Can I get clean SVG output?',
        a: 'Yes. The generated shape is a single SVG path you can copy into your markup or save as a file.',
      },
    ],
  },
  'theme-maker': {
    tagline: 'Build a light and dark theme and export it as CSS variables.',
    steps: [
      {
        title: 'Choose your colors',
        body: 'Set the base, surface, text and accent colors for your theme.',
      },
      {
        title: 'Check both modes',
        body: 'Preview the palette in light and dark to make sure both read well.',
      },
      {
        title: 'Export CSS variables',
        body: 'Copy the custom properties and drop them into your stylesheet.',
      },
    ],
    faqs: [
      {
        q: 'What does it export?',
        a: 'A set of CSS custom properties (variables) for your colors, ready to paste into a :root block and reference throughout your styles.',
      },
      {
        q: 'Does it cover light and dark mode?',
        a: 'Yes. You design both variants together, so your light and dark themes stay consistent.',
      },
    ],
  },
  'image-palette': {
    tagline: 'Extract the dominant colors from an image.',
    steps: [
      { title: 'Add an image', body: 'Drop in or choose a photo, screenshot or artwork.' },
      {
        title: 'Read the palette',
        body: 'The tool pulls out the most prominent colors as swatches.',
      },
      { title: 'Copy the colors', body: 'Copy any swatch’s HEX value into your design.' },
    ],
    faqs: [
      {
        q: 'How are the colors chosen?',
        a: 'The image’s pixels are clustered to find the most representative, prominent colors, giving you a palette that reflects the whole image rather than a few random pixels.',
      },
      {
        q: 'Is my image uploaded?',
        a: 'No. The palette is extracted in your browser, so the image never leaves your device.',
      },
    ],
  },
  'color-blindness': {
    tagline: 'Preview your colors as different types of color vision see them.',
    steps: [
      { title: 'Enter your colors', body: 'Add a color or a palette you want to check.' },
      { title: 'Simulate', body: 'See how it appears under common color-vision deficiencies.' },
      { title: 'Adjust', body: 'Tweak any pairs that become hard to tell apart.' },
    ],
    faqs: [
      {
        q: 'Which vision types are simulated?',
        a: 'The common forms of color-vision deficiency, including red–green types (protanopia and deuteranopia) and blue–yellow (tritanopia).',
      },
      {
        q: 'Why check for color blindness?',
        a: 'Around one in twelve men has some color-vision deficiency. Checking ensures information you convey with color — like status or chart series — stays distinguishable for everyone.',
      },
    ],
  },
  'color-name': {
    tagline: 'Find the nearest CSS named color for any hex value.',
    steps: [
      { title: 'Enter a hex color', body: 'Type a HEX value or pick one with the color picker.' },
      {
        title: 'See the closest name',
        body: 'The nearest CSS named color is shown alongside your input.',
      },
      { title: 'Copy', body: 'Copy the name or the exact value for your code.' },
    ],
    faqs: [
      {
        q: 'How is the nearest name found?',
        a: 'Your color is compared against the standard CSS named colors and the closest match by color distance is returned.',
      },
      {
        q: 'Will the named color match exactly?',
        a: 'Only if your value happens to equal a named color. Otherwise it is the closest name — useful for a readable label, though for precise design use the exact hex.',
      },
    ],
  },

  // --- Privacy -----------------------------------------------------------
  'metadata-cleaner': {
    tagline: 'Strip EXIF and GPS metadata from images before you share them.',
    steps: [
      {
        title: 'Add an image',
        body: 'Drop in or choose a photo. Its embedded metadata is read locally.',
      },
      {
        title: 'Remove the metadata',
        body: 'Strip EXIF details like camera model, timestamps and GPS location.',
      },
      {
        title: 'Download the clean image',
        body: 'Save a copy with the metadata removed — nothing is uploaded.',
      },
    ],
    highlights: [
      {
        title: 'Protect your location',
        body: 'Photos often embed the exact GPS coordinates where they were taken. Stripping them keeps that off a public post.',
      },
      {
        title: 'Cleaned on your device',
        body: 'The image is processed in your browser, so a photo you are trying to keep private is never uploaded.',
      },
      {
        title: 'Same picture, less data',
        body: 'Only the hidden metadata is removed — the visible image is unchanged.',
      },
    ],
    faqs: [
      {
        q: 'What metadata does it remove?',
        a: 'Embedded EXIF data such as the camera and lens, capture date and time, and any GPS location tags stored in the file.',
      },
      {
        q: 'Is the image uploaded to be cleaned?',
        a: 'No. Stripping happens entirely in your browser, which matters most for the private photos you would want cleaned in the first place.',
      },
    ],
  },
  encrypt: {
    tagline: 'Encrypt and decrypt text with a password, using AES-256.',
    steps: [
      { title: 'Enter your text', body: 'Type or paste the message you want to protect.' },
      {
        title: 'Set a password',
        body: 'Choose a strong password — it is the only way to decrypt the result.',
      },
      {
        title: 'Encrypt or decrypt',
        body: 'Copy the encrypted output to share, or paste ciphertext and your password to read it back.',
      },
    ],
    highlights: [
      {
        title: 'Strong, standard encryption',
        body: 'Text is protected with AES-256 via the browser’s Web Crypto API, with your password stretched into a key.',
      },
      {
        title: 'Only you hold the key',
        body: 'Encryption and decryption happen locally and the password is never sent anywhere, so only someone with it can read the message.',
      },
      {
        title: 'Shareable ciphertext',
        body: 'The output is plain text you can paste into a message or note; the recipient decrypts it with the same password.',
      },
    ],
    faqs: [
      {
        q: 'What happens if I forget the password?',
        a: 'The text cannot be recovered. AES-256 has no back door — without the exact password there is no way to decrypt, so store it somewhere safe.',
      },
      {
        q: 'Is my text or password uploaded?',
        a: 'No. Everything runs in your browser using the Web Crypto API, so neither the text nor the password ever leaves your device.',
      },
    ],
  },

  // --- Productivity ------------------------------------------------------
  'focus-timer': {
    tagline: 'A simple Pomodoro-style timer to focus and take breaks.',
    steps: [
      {
        title: 'Start a focus session',
        body: 'Begin a work interval and give one task your full attention.',
      },
      {
        title: 'Take a break',
        body: 'When the timer ends, take a short break before the next round.',
      },
      { title: 'Repeat', body: 'Cycle through focus and breaks to keep momentum through the day.' },
    ],
    faqs: [
      {
        q: 'What is the Pomodoro technique?',
        a: 'A time-management method of working in focused intervals — traditionally 25 minutes — separated by short breaks, to sustain concentration and avoid burnout.',
      },
      {
        q: 'Does it keep running if I switch tabs?',
        a: 'The timer runs in your browser. Keeping the tab open is the most reliable way to be notified when an interval ends.',
      },
    ],
  },
  kanban: {
    tagline: 'A lightweight kanban board that stays on your device.',
    steps: [
      { title: 'Add cards', body: 'Create cards for your tasks in the first column.' },
      {
        title: 'Move them across',
        body: 'Drag cards between columns like To do, Doing and Done as work progresses.',
      },
      {
        title: 'Pick up where you left off',
        body: 'Your board is saved locally, so it is still there when you return.',
      },
    ],
    faqs: [
      {
        q: 'Where is my board saved?',
        a: 'In your browser’s local storage on this device. There is no account and nothing is uploaded, so the board stays private to you.',
      },
      {
        q: 'Will my cards still be here later?',
        a: 'Yes, on the same browser and device — as long as you do not clear your site data. It is not synced across devices.',
      },
    ],
  },

  // --- Calculators -------------------------------------------------------
  calculator: {
    tagline: 'Calculate as you type, line by line, like a notepad.',
    steps: [
      { title: 'Type your maths', body: 'Write calculations in plain text, one per line.' },
      {
        title: 'See running results',
        body: 'Each line is evaluated live, and you can reference earlier lines.',
      },
      {
        title: 'Keep working',
        body: 'Adjust any line and the results update — great for quick, multi-step sums.',
      },
    ],
    highlights: [
      {
        title: 'Show your working',
        body: 'Unlike a button calculator, every step stays visible, so you can see and edit how you got to the answer.',
      },
      {
        title: 'Build on earlier lines',
        body: 'Reference previous results to chain a calculation together without retyping numbers.',
      },
      {
        title: 'Runs entirely locally',
        body: 'Your figures are evaluated in the browser and never uploaded.',
      },
    ],
    faqs: [
      {
        q: 'How is this different from a normal calculator?',
        a: 'It works like a text document: you write several calculations line by line, all stay visible, and you can edit any line or reuse its result — ideal for estimates and multi-step maths.',
      },
      {
        q: 'Can one line use the answer from another?',
        a: 'Yes. Earlier results can feed into later lines, so you can build up a calculation step by step.',
      },
    ],
  },
  'unit-converter': {
    tagline: 'Convert length, weight, data, time and temperature.',
    steps: [
      {
        title: 'Pick a category',
        body: 'Choose what you are converting — length, weight, data, time or temperature.',
      },
      {
        title: 'Enter a value',
        body: 'Type the amount and choose the units to convert from and to.',
      },
      { title: 'Read the result', body: 'The converted value appears instantly.' },
    ],
    faqs: [
      {
        q: 'What can I convert?',
        a: 'Length, weight, digital data sizes, time, and temperature, covering the common metric and imperial units in each.',
      },
      {
        q: 'Does it handle temperature correctly?',
        a: 'Yes. Temperature uses proper offset conversions (not just scaling), so Celsius, Fahrenheit and Kelvin convert accurately.',
      },
    ],
  },
  percentage: {
    tagline: 'Work out percentages, percent change and tip splitting.',
    steps: [
      {
        title: 'Choose a calculation',
        body: 'Pick what you need — a percentage of a number, percent change, or a tip split.',
      },
      {
        title: 'Enter the numbers',
        body: 'Fill in the values and the answer updates as you type.',
      },
      { title: 'Copy the result', body: 'Copy the figure for your invoice, budget or bill.' },
    ],
    faqs: [
      {
        q: 'What can it calculate?',
        a: 'The percentage of a number, what percent one number is of another, percentage increase or decrease, and splitting a bill with a tip.',
      },
      {
        q: 'How is percent change worked out?',
        a: 'As the difference between the old and new values divided by the old value — so a rise from 80 to 100 is a 25% increase.',
      },
    ],
  },
};

/**
 * Search-facing title and meta description per tool, kept separate from the
 * visible `tagline` so the copy can be keyword-rich and CTR-focused without
 * changing what a visitor reads on the page. `title` is the lead phrase; the
 * page appends " · Toolkit". Descriptions target ~150 characters.
 */
const SEO_META: Record<string, { title: string; description: string }> = {
  // Images & Media
  optimize: {
    title: 'Compress Image Online – Free JPEG Compressor',
    description:
      'Compress JPEG images online for free and shrink file size with no visible quality loss. Batch-process and download as a ZIP — all in your browser, no upload.',
  },
  crop: {
    title: 'Crop Image Online – Free Photo Cropper',
    description:
      'Crop images online for free to any aspect ratio — 1:1, 4:5, 16:9 and more. Pixel-precise framing with no quality loss, right in your browser. Nothing uploaded.',
  },
  resize: {
    title: 'Resize Image Online – Free Image Resizer',
    description:
      'Resize images online for free to exact pixel dimensions. Lock the aspect ratio to avoid stretching and download instantly — all in your browser.',
  },
  convert: {
    title: 'Convert Image Online – JPG, PNG & WebP',
    description:
      'Convert images between JPG, PNG and WebP online for free. Shrink files with WebP or keep transparency with PNG — fast, in your browser, with no upload.',
  },
  rotate: {
    title: 'Rotate & Flip Image Online – Free Tool',
    description:
      'Rotate images 90° or flip them horizontally and vertically online for free. Fix orientation in seconds, right in your browser — no upload and no sign-up.',
  },
  'image-editor': {
    title: 'Free Online Image Editor – All-in-One',
    description:
      'Compress, resize, crop, rotate and convert images in one free online editor. Do it all in your browser with no upload, no account and no watermark.',
  },
  screenshot: {
    title: 'Screenshot Beautifier – Add Background & Shadow',
    description:
      'Make screenshots look great online for free — add padding, a background and a soft shadow. Perfect for slides, READMEs and social, all in your browser.',
  },
  qr: {
    title: 'QR Code Generator – Free & No Expiry',
    description:
      'Generate QR codes online for free from any link or text. Codes never expire and need no tracking service — download a crisp image, made in your browser.',
  },
  favicon: {
    title: 'Favicon Generator – Image to Favicon, Free',
    description:
      'Turn any image into a favicon set for your website — free and online. Generates every size browsers need, right in your browser with nothing uploaded.',
  },
  'images-to-pdf': {
    title: 'Images to PDF – Free JPG & PNG to PDF',
    description:
      'Combine JPG and PNG images into a single PDF online for free. Reorder pages and export in seconds — assembled in your browser, with nothing uploaded.',
  },

  // Text & Documents
  markdown: {
    title: 'Markdown Editor Online – Live Preview, Free',
    description:
      'Write Markdown online for free with a live side-by-side preview. Headings, tables, code and links render as you type, all in your browser.',
  },
  'text-diff': {
    title: 'Text Diff Checker – Compare Text Online Free',
    description:
      'Compare two texts online for free and see added and removed lines. Unified or side-by-side view with change counts — right in your browser, nothing uploaded.',
  },
  'lorem-ipsum': {
    title: 'Lorem Ipsum Generator – Free Placeholder Text',
    description:
      'Generate Lorem Ipsum placeholder text online for free by paragraphs, sentences or words. Copy filler for any layout or mockup in a click — all in your browser.',
  },
  'case-converter': {
    title: 'Case Converter – camelCase, snake_case & More',
    description:
      'Convert text case online for free — camelCase, snake_case, kebab-case, Title Case, UPPER and lower. Transform names or paragraphs instantly in your browser.',
  },
  'line-tools': {
    title: 'Sort & Dedupe Lines – Free Text Line Tools',
    description:
      'Sort, de-duplicate, reverse, shuffle and clean lines of text online for free. Tidy any list in seconds, right in your browser — nothing is uploaded.',
  },
  'word-count': {
    title: 'Word Counter – Free Character & Word Count',
    description:
      'Count words, characters, sentences and reading time online for free as you type. Perfect for essays, posts and limits — all in your browser, no sign-up.',
  },
  slugify: {
    title: 'Slugify – Free URL Slug Generator',
    description:
      'Turn any title into a clean, URL-safe slug online for free. Spaces become hyphens and accents are simplified — copy the slug in a click, right in your browser.',
  },

  // Developer
  json: {
    title: 'JSON Formatter & Validator – Free Online',
    description:
      'Format, validate and minify JSON online for free. Pretty-print or minify with clear error messages — paste sensitive data safely, it stays in your browser.',
  },
  jwt: {
    title: 'JWT Decoder – Decode, Verify & Sign, Free',
    description:
      'Decode, inspect, verify and sign JSON Web Tokens online for free. See claims and expiry at a glance — tokens never leave your browser, so it stays private.',
  },
  regex: {
    title: 'Regex Tester – Test Regular Expressions Free',
    description:
      'Test regular expressions online for free with live match highlighting and capture groups. JavaScript flavour with every flag — runs entirely in your browser.',
  },
  base64: {
    title: 'Base64 Encode & Decode – Free Online Tool',
    description:
      'Encode and decode Base64 online for free, in both directions. Unicode-safe and instant — paste sensitive strings safely, everything stays in your browser.',
  },
  hash: {
    title: 'Hash Generator – SHA-256, SHA-512 & More',
    description:
      'Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes from text online for free. See every digest at once — computed in your browser, nothing is uploaded.',
  },
  checksum: {
    title: 'Checksum Verifier – Verify File Hash, Free',
    description:
      'Verify a file against its SHA checksum online for free. Confirm a download is intact and untampered — the file is hashed in your browser, never uploaded.',
  },
  uuid: {
    title: 'UUID Generator – Free Random UUID v4',
    description:
      'Generate random version 4 UUIDs online for free, one or many at a time. Cryptographically random and ready to copy — created in your browser, even offline.',
  },
  password: {
    title: 'Password Generator – Strong & Free Online',
    description:
      'Generate strong, random passwords online for free. Set length and character sets to any requirement — created securely in your browser and never sent.',
  },
  'url-encode': {
    title: 'URL Encode & Decode – Free Online Tool',
    description:
      'Percent-encode and decode URLs and query values online for free. Encode unsafe characters or decode escapes instantly — all in your browser, nothing uploaded.',
  },
  'html-entities': {
    title: 'HTML Entities – Encode & Decode, Free',
    description:
      'Escape and unescape HTML entities online for free. Turn <, > and & into entities or back again — handles named and numeric codes, right in your browser.',
  },
  'number-base': {
    title: 'Number Base Converter – Binary, Hex & More',
    description:
      'Convert numbers between binary, octal, decimal and hexadecimal online for free. Every base updates as you type — instant and in your browser, nothing uploaded.',
  },
  totp: {
    title: 'TOTP Generator – 2FA Codes Online, Free',
    description:
      'Generate two-factor (TOTP) codes from a Base32 secret online for free. See the current code and countdown — computed in your browser, the secret never leaves.',
  },
  hmac: {
    title: 'HMAC Generator – SHA-256 Signature, Free',
    description:
      'Compute a keyed HMAC signature online for free with SHA-256, SHA-384 or SHA-512. Sign API requests and webhooks in your browser — nothing is uploaded.',
  },
  timestamp: {
    title: 'Unix Timestamp Converter – Free Online',
    description:
      'Convert Unix timestamps to dates and back online for free, in UTC and local time. Handles seconds and milliseconds — instant and all in your browser.',
  },
  'csv-json': {
    title: 'CSV to JSON Converter – Free, Both Ways',
    description:
      'Convert CSV to JSON and JSON to CSV online for free. Header rows become keys and quoted values are handled correctly — right in your browser, nothing uploaded.',
  },
  'accessibility-checker': {
    title: 'Accessibility Checker – Keyboard & WCAG Audit',
    description:
      'Audit a public website’s keyboard accessibility online for free. Runs real Tab and focus journeys plus WCAG checks, then exports the evidence as portable JSON.',
  },

  // Design
  colors: {
    title: 'Color Converter – HEX, RGB & HSL, Free',
    description:
      'Convert colors between HEX, RGB and HSL online for free, with alpha support. Enter any format and copy the rest instantly — all in your browser, no sign-up.',
  },
  contrast: {
    title: 'Contrast Checker – WCAG AA & AAA, Free',
    description:
      'Check color contrast against WCAG AA and AAA online for free. See pass or fail for normal and large text as you adjust — instant and all in your browser.',
  },
  palette: {
    title: 'Color Palette Generator – Free Online',
    description:
      'Generate color palettes online for free from one base color — complementary, analogous and triadic harmonies plus tints and shades. Copy any swatch in a click.',
  },
  gradient: {
    title: 'CSS Gradient Generator – Free Online',
    description:
      'Build linear and radial CSS gradients online for free. Add color stops, set the angle and copy ready-to-use CSS — visual and instant, right in your browser.',
  },
  'color-mixer': {
    title: 'Color Mixer – Blend Colors Online, Free',
    description:
      'Blend two colors online for free and get the even steps between them. Great for gradients, chart scales and shade variants — all in your browser.',
  },
  blob: {
    title: 'SVG Blob Generator – Free Organic Shapes',
    description:
      'Generate organic SVG blob shapes online for free. Tune the complexity and colour, then copy clean SVG or download it — all in your browser.',
  },
  'theme-maker': {
    title: 'Color Theme Maker – Light & Dark CSS Vars',
    description:
      'Build a light and dark color theme online for free and export CSS variables. Design both modes together and paste the custom properties — all in your browser.',
  },
  'image-palette': {
    title: 'Color Palette from Image – Free Extractor',
    description:
      'Extract the dominant colors from any image online for free. Get a palette of prominent swatches to copy — the image never leaves your browser.',
  },
  'color-blindness': {
    title: 'Color Blindness Simulator – Free Online',
    description:
      'Simulate color blindness online for free and preview colors as protanopia, deuteranopia and tritanopia see them — check your palette stays clear.',
  },
  'color-name': {
    title: 'Color Name Finder – Nearest CSS Name, Free',
    description:
      'Find the nearest CSS named color for any hex value online for free. Enter a color and get a readable name plus the exact code — instant, right in your browser.',
  },

  // Privacy
  'metadata-cleaner': {
    title: 'Metadata Cleaner – Remove EXIF & GPS, Free',
    description:
      'Remove EXIF and GPS metadata from photos online for free before you share them. Strip camera and location data in your browser — the image is never uploaded.',
  },
  encrypt: {
    title: 'Text Encrypt & Decrypt – AES-256, Free',
    description:
      'Encrypt and decrypt text with a password online for free using AES-256. Share secure ciphertext anyone with the password can read — all in your browser.',
  },

  // Productivity
  'focus-timer': {
    title: 'Pomodoro Focus Timer – Free Online',
    description:
      'A free online Pomodoro focus timer — work in focused intervals with short breaks to stay productive. Simple, distraction-free and runs right in your browser.',
  },
  kanban: {
    title: 'Kanban Board – Free Online & Private',
    description:
      'A free, lightweight online kanban board. Add cards and drag them across columns — everything is saved locally in your browser, with no account and no upload.',
  },

  // Calculators
  calculator: {
    title: 'Notepad Calculator – Calculate as You Type',
    description:
      'A free online notepad calculator — write sums line by line and see running results. Reference earlier lines for multi-step maths, all in your browser.',
  },
  'unit-converter': {
    title: 'Unit Converter – Length, Weight & More, Free',
    description:
      'Convert length, weight, data, time and temperature online for free. Accurate metric and imperial conversions in every category — instant, right in your browser.',
  },
  percentage: {
    title: 'Percentage Calculator – Free Online',
    description:
      'Calculate percentages online for free — percent of a number, percent change and tip splitting. Get answers as you type, all in your browser with no sign-up.',
  },
};

export function getToolContent(tool: Tool): ToolContent {
  const bespoke = BESPOKE[tool.id] ?? {};
  const seo = SEO_META[tool.id];
  return {
    tagline: bespoke.tagline ?? tool.description,
    steps: bespoke.steps ?? [],
    highlights: bespoke.highlights ?? [],
    faqs: bespoke.faqs ?? [],
    seoTitle: seo?.title,
    seoDescription: seo?.description,
  };
}
