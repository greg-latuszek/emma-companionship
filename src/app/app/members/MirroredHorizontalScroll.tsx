'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { copyHorizontalScroll } from './mirrored-horizontal-scroll';

export function MirroredHorizontalScroll({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const leadingScroll = useRef<HTMLDivElement>(null);
  const followingScroll = useRef<HTMLDivElement>(null);
  const isCopying = useRef(false);
  const [contentWidth, setContentWidth] = useState(0);

  useLayoutEffect(() => {
    const tableBox = followingScroll.current;
    if (!tableBox) {
      return;
    }
    const box = tableBox;

    function rememberContentWidth(): void {
      const table = box.querySelector('table');
      setContentWidth(table?.scrollWidth ?? box.scrollWidth);
    }

    rememberContentWidth();
    const observer = new ResizeObserver(rememberContentWidth);
    observer.observe(box);
    const table = box.querySelector('table');
    if (table) {
      observer.observe(table);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-2">
      <div
        ref={leadingScroll}
        aria-hidden="true"
        className="horizontal-scroll horizontal-scroll-rail"
        onScroll={() => {
          copyHorizontalScroll(
            leadingScroll.current,
            followingScroll.current,
            isCopying
          );
        }}
      >
        <div style={{ width: contentWidth, height: 1 }} />
      </div>
      <div
        ref={followingScroll}
        className="horizontal-scroll min-w-0 max-w-full"
        onScroll={() => {
          copyHorizontalScroll(
            followingScroll.current,
            leadingScroll.current,
            isCopying
          );
        }}
      >
        {children}
      </div>
    </div>
  );
}
