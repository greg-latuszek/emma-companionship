'use client';

import { createContext, useContext, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { defaultVisualStyle, type VisualStyle } from '@/types/auth';

type VisualStyleChoice = {
  visualStyle: VisualStyle;
  applyVisualStyle: (visualStyle: VisualStyle) => void;
};

const VisualStyleContext = createContext<VisualStyleChoice>({
  visualStyle: defaultVisualStyle,
  applyVisualStyle: () => {},
});

export function VisualStyleProvider({
  visualStyle: storedVisualStyle,
  children,
}: {
  visualStyle: VisualStyle;
  children: ReactNode;
}): JSX.Element {
  const [visualStyle, applyVisualStyle] = useState(storedVisualStyle);

  return (
    <VisualStyleContext.Provider value={{ visualStyle, applyVisualStyle }}>
      {children}
    </VisualStyleContext.Provider>
  );
}

export function useVisualStyle(): VisualStyle {
  return useContext(VisualStyleContext).visualStyle;
}

export function useApplyVisualStyle(): (visualStyle: VisualStyle) => void {
  return useContext(VisualStyleContext).applyVisualStyle;
}
