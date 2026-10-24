import { describe, expect, it } from 'vitest';
import { barLengthShare } from './companion-load-chart';

describe('barLengthShare', () => {
  it('barLengthShare gives the largest load the full width', () => {
    expect(barLengthShare(5, 5)).toBe(1);
  });

  it('barLengthShare gives half the load half the width', () => {
    expect(barLengthShare(2, 4)).toBe(0.5);
  });

  it('barLengthShare gives no width when nobody accompanies anyone', () => {
    expect(barLengthShare(0, 0)).toBe(0);
  });
});
