'use client';

import Image from 'next/image';
import type { JSX } from 'react';

interface PageBackgroundProps {
  imageSource: string;
  imageAlt: string;
}

/**
 * Reusable background component with:
 * - Full-screen background image
 * - Dark gradient overlay
 * - Decorative border
 *
 * Used on both home page and companionship panel for consistency
 */
export function PageBackground({
  imageSource,
  imageAlt,
}: PageBackgroundProps): JSX.Element {
  return (
    <>
      {/* Background Image - Full screen */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <Image
          src={imageSource}
          alt={imageAlt}
          fill
          className="object-cover object-top"
          priority
          quality={85}
        />
      </div>

      {/* Dark Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 z-10 pointer-events-none" />

      {/* Decorative Outer Border */}
      <div className="absolute inset-0 pointer-events-none border-[16px] sm:border-[32px] border-white/15 z-30" />
    </>
  );
}
