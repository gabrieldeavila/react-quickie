import { useLayoutEffect, useState, type RefObject } from "react";
import { placeRowMenu, type MenuPlacement } from "../domain/place-row-menu";

/**
 * Fixed viewport position for an open row menu, so it floats over the
 * dialog instead of growing its scroll area. Follows scrolls and resizes.
 */
export function useRowMenuPlacement(
  isOpen: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  menuRef: RefObject<HTMLElement | null>,
): MenuPlacement | null {
  const [placement, setPlacement] = useState<MenuPlacement | null>(null);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPlacement(null);
      return;
    }
    const update = (): void => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      setPlacement(
        placeRowMenu(
          anchor.getBoundingClientRect(),
          menuRef.current?.offsetHeight ?? 0,
          { width: window.innerWidth, height: window.innerHeight },
        ),
      );
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen, anchorRef, menuRef]);

  return placement;
}
