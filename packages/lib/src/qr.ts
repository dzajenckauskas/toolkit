/**
 * QR code generation wrapper around the `qrcode` library. Kept thin so the
 * component stays declarative and the options are unit-testable.
 */

import QRCode from 'qrcode';

export const ERROR_LEVELS = ['L', 'M', 'Q', 'H'] as const;
export type ErrorLevel = (typeof ERROR_LEVELS)[number];

export interface QrOptions {
  errorCorrectionLevel?: ErrorLevel;
  width?: number;
  margin?: number;
  dark?: string;
  light?: string;
}

/** Render `text` to a PNG data URL. Rejects if the text is empty/too long. */
export async function qrToDataUrl(text: string, options: QrOptions = {}): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: options.errorCorrectionLevel ?? 'M',
    width: options.width ?? 256,
    margin: options.margin ?? 2,
    color: {
      dark: options.dark ?? '#000000',
      light: options.light ?? '#ffffff',
    },
  });
}
