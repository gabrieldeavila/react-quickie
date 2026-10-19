import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type PopoverDirection = "left" | "right";

type UsePopoverPanelOptions = {
  /** Where focus goes after Escape or a pick; defaults to the trigger (the element with aria-expanded). */
  getReturnFocusTarget?: () => HTMLElement | null;
};

/** Open state, outside-click/Escape closing and left/right flip for a popover panel. */
export function usePopoverPanel({
  getReturnFocusTarget,
}: UsePopoverPanelOptions = {}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openDirection, setOpenDirection] = useState<PopoverDirection>("right");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const toggle = useCallback(() => setIsOpen((current) => !current), []);
  const close = useCallback(() => setIsOpen(false), []);

  const restoreFocus = useCallback(() => {
    const target =
      getReturnFocusTarget?.() ??
      containerRef.current?.querySelector<HTMLElement>("[aria-expanded]");
    target?.focus();
  }, [getReturnFocusTarget]);

  /** Closes and puts focus back, for keyboard picks inside the panel. */
  const closeAndRestoreFocus = useCallback(() => {
    setIsOpen(false);
    restoreFocus();
  }, [restoreFocus]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent): void => {
      if (!containerRef.current?.contains(event.target as Node))
        setIsOpen(false);
    };
    // preventDefault marks the Escape as used, so it doesn't also stop the response.
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      const hadFocus = containerRef.current?.contains(document.activeElement);
      setIsOpen(false);
      if (hadFocus) restoreFocus();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, restoreFocus]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const updateDirection = (): void => {
      const container = containerRef.current;
      const panel = panelRef.current;
      if (!container || !panel) return;
      const containerRect = container.getBoundingClientRect();
      const panelWidth = panel.offsetWidth || 220;
      const spaceRight = window.innerWidth - containerRect.left;
      const spaceLeft = containerRect.right;
      setOpenDirection(
        spaceRight < panelWidth + 16 && spaceLeft >= panelWidth
          ? "left"
          : "right",
      );
    };
    updateDirection();
    window.addEventListener("resize", updateDirection);
    window.addEventListener("scroll", updateDirection, true);
    return () => {
      window.removeEventListener("resize", updateDirection);
      window.removeEventListener("scroll", updateDirection, true);
    };
  }, [isOpen]);

  return {
    isOpen,
    toggle,
    close,
    closeAndRestoreFocus,
    openDirection,
    containerRef,
    panelRef,
  };
}
