'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import type { JSX } from 'react';

import { useVisualStyle } from '@/components/VisualStyleProvider';
import {
  glassControlClassName,
  glassControlSurfaceClassName,
  glassPanelClassName,
  visualSurfaces,
} from '@/components/visual-style-surfaces';

export const semiTransparentControlSurfaceClassName = glassControlSurfaceClassName;
export const semiTransparentControlClassName = glassControlClassName;
export const semiTransparentPanelClassName = glassPanelClassName;

export function SemiTransparentPanel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  const { panel } = visualSurfaces(useVisualStyle());
  return <div className={`${panel} ${className}`}>{children}</div>;
}

interface SemiTransparentButtonProps {
  href: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Reusable button styled with semi-transparent effect
 * Used on home page and other pages for consistency
 *
 * Default styling: white/15 bg, white/35 border, white/25 on hover
 * Includes backdrop blur and smooth transitions
 */
export function SemiTransparentButton({
  href,
  children,
  delay = 0.7,
  className = '',
}: SemiTransparentButtonProps): JSX.Element {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      className={`${semiTransparentControlClassName} ${className}`}
    >
      {children}
    </motion.a>
  );
}

/**
 * Alternative version using Next.js Link for client-side navigation
 */
interface SemiTransparentLinkProps extends SemiTransparentButtonProps {
  href: string;
}

export function SemiTransparentLink({
  href,
  children,
  delay = 0.7,
  className = '',
}: SemiTransparentLinkProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
    >
      <Link
        href={href}
        className={`${semiTransparentControlClassName} ${className}`}
      >
        {children}
      </Link>
    </motion.div>
  );
}
