/** ArrowUp/ArrowDown in the menu: moves by `delta` and wraps around. */
export function moveActiveIndex(
  index: number,
  delta: number,
  count: number,
): number {
  if (count <= 0) return 0;
  return (((index + delta) % count) + count) % count;
}
