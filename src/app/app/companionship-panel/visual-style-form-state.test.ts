import { describe, expect, it } from 'vitest';
import { visualStyleFromForm, visualStyleLabels } from './visual-style-form-state';

describe('visualStyleFromForm', () => {
  it('visualStyleFromForm reads the high-contrast choice from the settings form', () => {
    const form = new FormData();
    form.set('visual_style', 'high-contrast');

    expect(visualStyleFromForm(form)).toBe('high-contrast');
  });

  it('visualStyleFromForm ignores a visual style the form does not offer', () => {
    const form = new FormData();
    form.set('visual_style', 'neon');

    expect(visualStyleFromForm(form)).toBeNull();
  });
});

describe('visualStyleLabels', () => {
  it('visualStyleLabels names the stored styles in Polish', () => {
    expect(visualStyleLabels['semi-transparent']).toBe('Półprzeźroczysty');
    expect(visualStyleLabels['high-contrast']).toBe('Kontrastowy');
  });
});
