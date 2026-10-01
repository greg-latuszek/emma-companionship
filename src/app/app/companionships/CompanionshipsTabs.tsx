'use client';

import Link from 'next/link';
import type { JSX } from 'react';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import {
  companionshipsTabHref,
  companionshipsTabs,
  companionshipsTabTitles,
  type CompanionshipsTab,
} from './companionships-tab';

export function CompanionshipsTabs({
  selectedTab,
}: {
  selectedTab: CompanionshipsTab;
}): JSX.Element {
  const surfaces = visualSurfaces(useVisualStyle());

  return (
    <nav
      aria-label="Akompaniamenty"
      className={`mb-6 flex flex-wrap border-b ${surfaces.hairline}`}
    >
      {companionshipsTabs.map((tab) => {
        const isSelected = tab === selectedTab;
        return (
          <Link
            key={tab}
            href={companionshipsTabHref(tab)}
            aria-current={isSelected ? 'page' : undefined}
            className={`px-4 py-2 text-sm font-medium ${surfaces.strongText} ${surfaces.tabChoice(isSelected)} ${surfaces.focusOutline}`}
          >
            {companionshipsTabTitles[tab]}
          </Link>
        );
      })}
      <Link
        href="/app/companionships/new"
        className={`px-4 py-2 text-sm font-medium ${surfaces.strongText} ${surfaces.tabChoice(false)} ${surfaces.focusOutline}`}
      >
        + Dodaj Akompaniament
      </Link>
    </nav>
  );
}
