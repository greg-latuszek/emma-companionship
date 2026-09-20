import type { JSX } from 'react';
import { decorativeFrame } from '@/components/decorative-frame';

export function PageCredit(): JSX.Element {
  return (
    <div className={`${decorativeFrame.paddingClassName} pointer-events-none`}>
      <div className="flex flex-col font-sans text-[11px] text-white/70 tracking-[0.3em] uppercase leading-relaxed text-left">
        <span>© Emmanuel Community 2026</span>
      </div>
    </div>
  );
}
