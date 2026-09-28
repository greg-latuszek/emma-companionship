import { describe, expect, it } from 'vitest';
import { copyHorizontalScroll } from './mirrored-horizontal-scroll';

describe('copyHorizontalScroll', () => {
  it('copyHorizontalScroll copies the left offset to the other scrollport', () => {
    const from = { scrollLeft: 40 };
    const to = { scrollLeft: 0 };

    copyHorizontalScroll(from, to, { current: false });

    expect(to.scrollLeft).toBe(40);
  });

  it('copyHorizontalScroll does not bounce the offset back while a copy is already running', () => {
    const from = { scrollLeft: 40 };
    const to = { scrollLeft: 0 };

    copyHorizontalScroll(from, to, { current: true });

    expect(to.scrollLeft).toBe(0);
  });
});
