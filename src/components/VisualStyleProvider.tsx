'use client';

import { createContext, useContext } from 'react';
import type { JSX, ReactNode } from 'react';
import { defaultVisualStyle, type VisualStyle } from '@/types/auth';

const VisualStyleContext = createContext<VisualStyle>(defaultVisualStyle);

export function VisualStyleProvider({
  visualStyle,
  children,
}: {
  visualStyle: VisualStyle;
  children: ReactNode;
}): JSX.Element {
  return (
    <VisualStyleContext.Provider value={visualStyle}>
      {children}
    </VisualStyleContext.Provider>
  );
}

export function useVisualStyle(): VisualStyle {
  return useContext(VisualStyleContext);
}
