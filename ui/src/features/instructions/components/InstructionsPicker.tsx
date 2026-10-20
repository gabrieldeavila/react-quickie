import { memo, useState } from "react";
import { FiEdit3, FiSliders } from "react-icons/fi";
import { PopoverTrigger } from "@/components/primitives/popover-trigger";
import { usePopoverPanel } from "@/components/primitives/usePopoverPanel";
import { filterInstructions } from "../domain/filter-instructions";
import type { InstructionSummary } from "../domain/instruction.types";
import { instructionsChipLabel } from "../domain/instructions-chip-label";
import { InstructionsPickerRow } from "./InstructionsPickerRow";

type Props = {
  instructions: InstructionSummary[];
  selected: InstructionSummary[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onManage: () => void;
  error?: string | null;
};

/** Message-box chip; opens upwards with a searchable multi-select list. */
export const InstructionsPicker = memo(
  ({ instructions, selected, selectedIds, onToggle, onManage, error }: Props) => {
    const { isOpen, toggle, close, openDirection, containerRef, panelRef } =
      usePopoverPanel();
    const [query, setQuery] = useState("");
    const visible = filterInstructions(instructions, query);
    const label = instructionsChipLabel(selected);

    const handleManage = () => {
      close();
      onManage();
    };

    return (
      <div className="chat-mode-popover" ref={containerRef}>
        <PopoverTrigger
          icon={FiEdit3}
          label={label}
          isOpen={isOpen}
          onClick={toggle}
          ariaLabel="Select instructions"
          title={
            selected.length
              ? `Instructions: ${selected.map(({ name }) => name).join(", ")}`
              : "Instructions"
          }
          hasPopup="listbox"
        />

        {isOpen ? (
          <div
            ref={panelRef}
            className={`chat-mode-popover__panel chat-mode-popover__panel--${openDirection} chat-mode-popover__panel--up instructions-panel`}
          >
            <div className="chat-mode-popover__title">Instructions</div>
            <input
              className="instructions-panel__search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search instructions"
              aria-label="Search instructions"
              autoFocus
            />
            {error ? <p className="chat-modal__error">{error}</p> : null}
            <div
              className="instructions-panel__list"
              role="listbox"
              aria-label="Instructions"
              aria-multiselectable="true"
            >
              {visible.length === 0 ? (
                <p className="instructions-panel__empty">
                  {instructions.length ? "No matches." : "No instructions yet."}
                </p>
              ) : (
                visible.map((instruction) => (
                  <InstructionsPickerRow
                    key={instruction.id}
                    instruction={instruction}
                    isSelected={selectedIds.includes(instruction.id)}
                    onToggle={onToggle}
                  />
                ))
              )}
            </div>
            <button
              type="button"
              className="chat-mode-popover__option instructions-panel__manage"
              onClick={handleManage}
            >
              <span className="chat-mode-popover__option-icon" aria-hidden="true">
                <FiSliders className="chat-mode-popover__option-icon-svg" />
              </span>
              <span className="chat-mode-popover__option-label">
                Manage instructions…
              </span>
            </button>
          </div>
        ) : null}
      </div>
    );
  },
);
