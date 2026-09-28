import type { VisualStyle } from '@/types/auth';

export const glassControlSurfaceClassName =
  'rounded-full bg-white/15 hover:bg-white/25 border border-white/35 text-white font-sans font-medium text-sm sm:text-base uppercase tracking-widest transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-xl';

export const glassControlClassName =
  `inline-block px-8 sm:px-12 py-3 sm:py-4 ${glassControlSurfaceClassName}`;

export const glassPanelClassName =
  'rounded-lg bg-white/15 border border-white/35 text-white backdrop-blur-md shadow-lg';

export type VisualSurfaces = {
  panel: string;
  panelHover: string;
  focusOutline: string;
  control: string;
  field: string;
  mutedText: string;
  secondaryText: string;
  strongText: string;
  hairline: string;
  rowDivider: string;
  stickyCell: string;
  dangerText: string;
  face: string;
  hint: string;
  formError: string;
  secondaryButton: string;
  primaryButton: string;
  choice: (isSelected: boolean) => string;
};

const glassSurfaces: VisualSurfaces = {
  panel: glassPanelClassName,
  panelHover: 'hover:bg-white/25',
  focusOutline:
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
  control: glassControlClassName,
  field:
    'rounded border border-white/35 bg-white/15 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40',
  mutedText: 'text-white/80',
  secondaryText: 'text-white/70',
  strongText: 'text-white',
  hairline: 'border-white/25',
  rowDivider: 'divide-white/20',
  stickyCell: 'bg-black/35 backdrop-blur-sm',
  dangerText: 'text-red-200',
  face: 'h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/20 ring-1 ring-white/40',
  hint: 'rounded border border-white/25 bg-white/10 px-3 py-2 text-sm text-white/90',
  formError: 'rounded border border-red-300/50 bg-red-500/20 px-3 py-2 text-red-50',
  secondaryButton:
    'rounded-full border border-white/35 bg-white/10 px-4 py-2 text-center text-white backdrop-blur-md hover:bg-white/20',
  primaryButton:
    'rounded-full border border-white/35 bg-white/25 px-4 py-2 text-white backdrop-blur-md hover:bg-white/35',
  choice: (isSelected) =>
    isSelected
      ? 'border-white/60 bg-white/30'
      : 'border-white/25 bg-white/10 hover:bg-white/20',
};

const highContrastSurfaces: VisualSurfaces = {
  panel: 'rounded-lg bg-white border border-gray-300 text-gray-900 shadow-lg',
  panelHover: 'hover:bg-gray-100',
  focusOutline:
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900',
  control:
    'inline-block px-8 sm:px-12 py-3 sm:py-4 rounded-full bg-white hover:bg-gray-100 border border-gray-400 text-gray-900 font-sans font-medium text-sm sm:text-base uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-xl',
  field:
    'rounded border border-gray-400 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400',
  mutedText: 'text-gray-600',
  secondaryText: 'text-gray-500',
  strongText: 'text-gray-900',
  hairline: 'border-gray-200',
  rowDivider: 'divide-gray-200',
  stickyCell: 'bg-white',
  dangerText: 'text-red-700',
  face: 'h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-200 ring-1 ring-gray-400',
  hint: 'rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800',
  formError: 'rounded border border-red-300 bg-red-50 px-3 py-2 text-red-800',
  secondaryButton:
    'rounded-full border border-gray-400 bg-white px-4 py-2 text-center text-gray-900 hover:bg-gray-100',
  primaryButton:
    'rounded-full border border-gray-900 bg-gray-900 px-4 py-2 text-white hover:bg-gray-800',
  choice: (isSelected) =>
    isSelected
      ? 'border-gray-900 bg-gray-200'
      : 'border-gray-300 bg-white hover:bg-gray-50',
};

export function visualSurfaces(visualStyle: VisualStyle): VisualSurfaces {
  if (visualStyle === 'high-contrast') {
    return highContrastSurfaces;
  }
  return glassSurfaces;
}
