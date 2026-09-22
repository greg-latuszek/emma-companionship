import { describe, expect, it } from 'vitest';
import { glassPanelClassName, visualSurfaces } from './visual-style-surfaces';

describe('visualSurfaces', () => {
  it('visualSurfaces keeps the glass panel when the login member uses the default style', () => {
    expect(visualSurfaces('semi-transparent').panel).toBe(glassPanelClassName);
  });

  it('visualSurfaces uses an opaque white panel when the login member chose high-contrast', () => {
    const surfaces = visualSurfaces('high-contrast');

    expect(surfaces.panel).toContain('bg-white');
    expect(surfaces.panel).toContain('text-gray-900');
    expect(surfaces.panel).not.toContain('backdrop-blur');
    expect(surfaces.mutedText).toBe('text-gray-600');
  });
});
