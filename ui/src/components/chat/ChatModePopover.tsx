import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FiCode, FiLayout, FiMinusCircle, FiPackage, FiShuffle } from "react-icons/fi";
import { AgentFocusEnum, AgentSpecialtyEnum } from "../../enum/agent.enum";

type FocusPopoverProps = {
  value: AgentFocusEnum;
  onChange: (value: AgentFocusEnum) => void;
};
type SpecialtyPopoverProps = {
  value: AgentSpecialtyEnum;
  onChange: (value: AgentSpecialtyEnum) => void;
  focus: AgentFocusEnum;
};
type Option<T> = { value: T; label: string; icon: IconType };

type PopoverProps<T extends string | number> = {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  ariaLabel: string;
  title: string;
  defaultIcon?: IconType;
};

const FOCUS_OPTIONS: Option<AgentFocusEnum>[] = [
  { value: AgentFocusEnum.FRONTEND, label: "Frontend", icon: FiCode },
  { value: AgentFocusEnum.BACKEND, label: "Backend", icon: FiPackage },
  { value: AgentFocusEnum.AGNOSTIC, label: "Agnóstico", icon: FiShuffle },
];

const SPECIALTY_OPTIONS: Option<AgentSpecialtyEnum>[] = [
  {
    value: AgentSpecialtyEnum.NONE,
    label: "Sem especialidade",
    icon: FiMinusCircle,
  },
  {
    value: AgentSpecialtyEnum.LANDING_PAGES,
    label: "Landing Pages",
    icon: FiLayout,
  },
  { value: AgentSpecialtyEnum.FORMS, label: "Forms", icon: FiPackage },
];

function Popover<T extends string | number>({ value, onChange, options, ariaLabel, title, defaultIcon: DefaultIcon }: PopoverProps<T>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openDirection, setOpenDirection] = useState<"left" | "right">("right");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const currentOption: Option<T> | undefined = useMemo(() => options.find((option) => option.value === value), [options, value]);
  const TriggerIcon: IconType = currentOption?.icon ?? DefaultIcon ?? FiMinusCircle;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent): void => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
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
      setOpenDirection(spaceRight < panelWidth + 16 && spaceLeft >= panelWidth ? "left" : "right");
    };
    updateDirection();
    window.addEventListener("resize", updateDirection);
    window.addEventListener("scroll", updateDirection, true);
    return () => {
      window.removeEventListener("resize", updateDirection);
      window.removeEventListener("scroll", updateDirection, true);
    };
  }, [isOpen]);

  return (
    <div className="chat-mode-popover" ref={containerRef}>
      <button
        type="button"
        className="chat-mode-popover__trigger"
        onClick={() => setIsOpen((current: boolean) => !current)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        title={title}
      >
        <span className="chat-mode-popover__icon" aria-hidden="true">
          <TriggerIcon className="chat-mode-popover__icon-svg" />
        </span>
      </button>
      {isOpen ? (
        <div ref={panelRef} className={`chat-mode-popover__panel chat-mode-popover__panel--${openDirection}`} role="listbox" aria-label={ariaLabel}>
          <div className="chat-mode-popover__title">{title}</div>
          {options.map((option) => {
            const isSelected: boolean = option.value === value;
            const OptionIcon: IconType = option.icon;
            return (
              <button
                key={String(option.value)}
                type="button"
                className={`chat-mode-popover__option ${isSelected ? "chat-mode-popover__option--selected" : ""}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
              >
                <span className="chat-mode-popover__option-icon" aria-hidden="true">
                  <OptionIcon className="chat-mode-popover__option-icon-svg" />
                </span>
                <span className="chat-mode-popover__option-label">{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function ChatModePopover({ value, onChange }: FocusPopoverProps) {
  return <Popover value={value} onChange={onChange} options={FOCUS_OPTIONS} ariaLabel="Selecionar foco do agente" title="Modo" defaultIcon={FiCode} />;
}

export function ChatSpecialtyPopover({ value, onChange, focus }: SpecialtyPopoverProps) {
  if (focus !== AgentFocusEnum.FRONTEND) return null;
  return <Popover value={value} onChange={onChange} options={SPECIALTY_OPTIONS} ariaLabel="Selecionar especialidade do agente" title="Especialidade" defaultIcon={FiMinusCircle} />;
}
