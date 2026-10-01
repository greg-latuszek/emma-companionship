'use client';

import Link from 'next/link';
import type { JSX } from 'react';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';

export function MembersTabs(): JSX.Element {
  const surfaces = visualSurfaces(useVisualStyle());

  return (
    <nav
      aria-label="Członkowie wspólnoty"
      className={`mb-6 flex flex-wrap border-b ${surfaces.hairline}`}
    >
      <Link
        href="/app/members"
        aria-current="page"
        className={`px-4 py-2 text-sm font-medium ${surfaces.strongText} ${surfaces.tabChoice(true)} ${surfaces.focusOutline}`}
      >
        Członkowie Wspólnoty
      </Link>
      <Link
        href="/app/members/new"
        className={`px-4 py-2 text-sm font-medium ${surfaces.strongText} ${surfaces.tabChoice(false)} ${surfaces.focusOutline}`}
      >
        + Dodaj Osobę
      </Link>
    </nav>
  );
}
