/** Share of the chart width (0 to 1) a bar takes; the largest load fills the whole width. */
export function barLengthShare(load: number, largestLoad: number): number {
  if (largestLoad <= 0) {
    return 0;
  }
  return load / largestLoad;
}
