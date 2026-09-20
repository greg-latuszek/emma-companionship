/**
 * Thickness of the decorative frame around the page.
 *
 * AppArea sits this far inside the screen. Navbar pads its controls by the
 * same amount, so a control (logo, login) is two frame-widths from the outer edge.
 */
export const decorativeFrame = {
  borderClassName: 'border-[16px] sm:border-[32px]',
  insetClassName: 'inset-[16px] sm:inset-[32px]',
  paddingClassName: 'p-[16px] sm:p-[32px]',
  topRightClassName: 'top-[16px] right-[16px] sm:top-[32px] sm:right-[32px]',
} as const;
