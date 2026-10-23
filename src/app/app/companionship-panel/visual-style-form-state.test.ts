import { describe, expect, it } from 'vitest';
import { messagesFor } from '@/i18n/messages';
import { visualStyleFromForm, visualStyleLabelKeys } from './visual-style-form-state';

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

describe('visualStyleLabelKeys', () => {
  it('visualStyleLabelKeys names the stored styles in Polish', () => {
    const polish = messagesFor('pl');

    expect(polish[visualStyleLabelKeys['semi-transparent']]).toBe('Półprzeźroczysty');
    expect(polish[visualStyleLabelKeys['high-contrast']]).toBe('Kontrastowy');
  });

  it('visualStyleLabelKeys names the stored styles in English', () => {
    const english = messagesFor('en');

    expect(english[visualStyleLabelKeys['semi-transparent']]).toBe('Semi-transparent');
    expect(english[visualStyleLabelKeys['high-contrast']]).toBe('High contrast');
  });
});
