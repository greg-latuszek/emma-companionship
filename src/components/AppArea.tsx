import type { JSX } from 'react';
import { decorativeFrame } from '@/components/decorative-frame';

/**
 * Darker inner stage, inset by the decorative frame.
 * Navbar and the rest of the page live here so they cannot leave the frame.
 */
export function AppArea({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div
      className={`absolute ${decorativeFrame.insetClassName} z-10 flex flex-col overflow-y-auto bg-gradient-to-b from-black/50 via-black/40 to-black/60`}
    >
      {children}
    </div>
  );
}
