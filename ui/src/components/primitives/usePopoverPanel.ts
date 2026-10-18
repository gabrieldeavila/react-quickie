import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type PopoverDirection = "left" | "right";

/** Open state, outside-click/Escape closing and left/right flip for a popover panel. */
export function usePopoverPanel() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openDirection, setOpenDirection] = useState<PopoverDirection>("right");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const toggle = useCallback(() => setIsOpen((current) => !current), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent): void => {
      if (!containerRef.current?.contains(event.target as Node))
        setIsOpen(false);
    };
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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

  return { isOpen, toggle, close, openDirection, containerRef, panelRef };
}
