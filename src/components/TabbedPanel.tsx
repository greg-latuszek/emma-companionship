'use client';

import Link from 'next/link';
import type { JSX, ReactNode } from 'react';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';

export interface TabDescriptor {
  href: string;
  label: string;
  isActive?: boolean;
}

export function TabbedPanel({
  tabs,
  ariaLabel,
  children,
}: {
  tabs: TabDescriptor[];
  ariaLabel?: string;
  children?: ReactNode;
}): JSX.Element {
  const surfaces = visualSurfaces(useVisualStyle());

  return (
    <>
      <nav
        aria-label={ariaLabel}
        className={`mb-6 flex flex-wrap border-b ${surfaces.hairline}`}
      >
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={tab.isActive ? 'page' : undefined}
            className={`px-4 py-2 text-sm font-medium ${surfaces.strongText} ${surfaces.tabChoice(tab.isActive ?? false)} ${surfaces.focusOutline}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </>
  );
}
