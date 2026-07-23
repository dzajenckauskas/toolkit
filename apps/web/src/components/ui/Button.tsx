'use client';

import styled from '@emotion/styled';
import Link from 'next/link';
import { buttonStyles, isButtonStyleProp, type ButtonStyleProps } from './buttonStyles';

/**
 * Button primitives. `Button` is a real <button>; `ButtonLink` is a Next.js
 * <Link> styled identically (for navigation); `DownloadLink` is a plain <a>
 * styled identically (for object-URL downloads, where Link is inappropriate).
 */

const notStyleProp = (prop: string) => !isButtonStyleProp(prop);

export const Button = styled('button', { shouldForwardProp: notStyleProp })<ButtonStyleProps>(
  ({ theme, variant, size }) => buttonStyles(theme, { variant, size }),
);

export const ButtonLink = styled(Link, { shouldForwardProp: notStyleProp })<ButtonStyleProps>(
  ({ theme, variant, size }) => buttonStyles(theme, { variant, size }),
);

export const DownloadLink = styled('a', { shouldForwardProp: notStyleProp })<ButtonStyleProps>(
  ({ theme, variant, size }) => buttonStyles(theme, { variant, size }),
);
