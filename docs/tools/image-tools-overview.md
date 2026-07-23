# Image Tools Overview

## Product model

Each core image utility should work as a standalone route and share only proven common components.

Suggested routes:

- `/optimize`
- `/crop`
- `/convert`
- `/resize`

A later project workflow may combine these operations, but that is not required initially.

## Image Optimizer

### User outcome

Reduce image file size while keeping acceptable visual quality.

### Core controls

- Compression or quality level
- Output format when relevant
- Metadata behavior
- Batch processing

### Core output data

- Original filename
- Original and output format
- Original and output dimensions
- Original and output file size
- Percentage saved
- Error status

## Image Cropper

### User outcome

Create the correct framing and aspect ratio for a storefront or marketplace.

### Core controls

- Free crop
- Fixed aspect ratio
- Zoom
- Position
- Rotation if justified
- Export dimensions

### Useful presets

- Square 1:1
- Portrait 4:5
- Landscape 4:3
- Widescreen 16:9
- Custom dimensions

## Image Converter

### User outcome

Convert images into a compatible or more efficient format.

### Initial formats

- JPEG
- PNG
- WebP
- AVIF where browser support and output quality are dependable

### Important states

- Transparency loss warning
- Unsupported source format
- Animation loss warning
- Quality controls for lossy formats

## Image Resizer

### User outcome

Change image dimensions without manually calculating ratios.

### Core modes

- Exact width and height
- Width only
- Height only
- Fit within maximum dimensions
- Scale by percentage

### Required safety

- Preserve aspect ratio by default
- Warn about distortion
- Avoid accidental enlargement by default

## Later project workflows

A project could define:

- Required aspect ratio
- Required dimensions
- Preferred format
- Maximum file size
- Filename rules
- Background rules
- Compression quality

Users could then upload images and apply the complete ruleset consistently.
