import Image from 'next/image';
import type { JSX } from 'react';
import { decorativeFrame } from '@/components/decorative-frame';

interface PageBackgroundProps {
  imageSource: string;
  imageAlt: string;
  children: React.ReactNode;
  id?: string;
}

/**
 * Full-screen photograph plus the decorative outer frame.
 * Page chrome belongs in AppArea, which sits inside this frame.
 */
export function PageBackground({
  imageSource,
  imageAlt,
  children,
  id,
}: PageBackgroundProps): JSX.Element {
  return (
    <div
      id={id}
      className="relative min-h-screen w-full overflow-hidden text-white font-serif select-none"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src={imageSource}
          alt={imageAlt}
          fill
          className="object-cover object-top"
          priority
          quality={85}
        />
      </div>

      <div
        className={`absolute inset-0 z-20 pointer-events-none ${decorativeFrame.borderClassName} border-white/15`}
      />

      {children}
    </div>
  );
}
