export type MenuAnchor = { top: number; bottom: number; right: number };

export type MenuPlacement = { top: number; right: number };

const GAP = 8;

/**
 * Viewport position of a fixed menu right-aligned to its trigger: below it,
 * or above when it doesn't fit below and there's more room above.
 */
export function placeRowMenu(
  anchor: MenuAnchor,
  menuHeight: number,
  viewport: { width: number; height: number },
): MenuPlacement {
  const spaceBelow = viewport.height - anchor.bottom - GAP;
  const spaceAbove = anchor.top - GAP;
  const opensUp = menuHeight > spaceBelow && spaceAbove > spaceBelow;
  const top = opensUp
    ? Math.max(GAP, anchor.top - GAP - menuHeight)
    : anchor.bottom + GAP;
  return { top, right: viewport.width - anchor.right };
}
