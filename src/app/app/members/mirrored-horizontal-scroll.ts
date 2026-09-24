export function copyHorizontalScroll(
  from: { scrollLeft: number } | null,
  to: { scrollLeft: number } | null,
  isCopying: { current: boolean }
): void {
  if (!from || !to || isCopying.current) {
    return;
  }

  isCopying.current = true;
  to.scrollLeft = from.scrollLeft;
  isCopying.current = false;
}
