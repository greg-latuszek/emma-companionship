import { describe, expect, it } from 'vitest';
import {
  defaultVisualStyle,
  visualStyleOrDefault,
  visualStyleToStore,
} from '@/types/auth';

describe('visualStyleOrDefault', () => {
  it('visualStyleOrDefault treats an empty visual_style as the semi-transparent default', () => {
    expect(visualStyleOrDefault(null)).toBe(defaultVisualStyle);
    expect(visualStyleOrDefault(undefined)).toBe('semi-transparent');
  });

  it('visualStyleOrDefault keeps high-contrast when the login member chose it', () => {
    expect(visualStyleOrDefault('high-contrast')).toBe('high-contrast');
  });

  it('visualStyleOrDefault keeps an explicit semi-transparent choice', () => {
    expect(visualStyleOrDefault('semi-transparent')).toBe('semi-transparent');
  });
});

describe('visualStyleToStore', () => {
  it('visualStyleToStore writes an empty visual_style for the default', () => {
    expect(visualStyleToStore('semi-transparent')).toBeNull();
  });

  it('visualStyleToStore writes high-contrast when the login member chose it', () => {
    expect(visualStyleToStore('high-contrast')).toBe('high-contrast');
  });
});
