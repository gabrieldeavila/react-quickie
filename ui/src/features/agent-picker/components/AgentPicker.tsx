import { memo, useMemo } from "react";
import { FiCode } from "react-icons/fi";
import { PopoverTrigger } from "@/components/primitives/popover-trigger";
import { usePopoverPanel } from "@/components/primitives/usePopoverPanel";
import type {
  AgentChoice,
  AgentPickerGroup,
} from "../domain/build-agent-picker-options";
import { describeAgentChoice } from "../domain/describe-agent-choice";
import { AgentPickerRow } from "./AgentPickerRow";

type AgentPickerProps = {
  groups: AgentPickerGroup[];
  value: AgentChoice;
  onChange: (choice: AgentChoice) => void;
};

/** One picker for mode and specialty; opens upwards from the message box. */
export const AgentPicker = memo(
  ({ groups, value, onChange }: AgentPickerProps) => {
    const { isOpen, toggle, close, openDirection, containerRef, panelRef } =
      usePopoverPanel();
    const summary = useMemo(
      () => describeAgentChoice(groups, value),
      [groups, value],
    );

    const handleSelect = (choice: AgentChoice): void => {
      onChange(choice);
      close();
    };

    return (
      <div className="chat-mode-popover" ref={containerRef}>
        <PopoverTrigger
          icon={summary?.icon ?? FiCode}
          label={summary?.label ?? "Agent"}
          isOpen={isOpen}
          onClick={toggle}
          ariaLabel="Select agent mode and specialty"
          title={`Agent: ${summary?.label ?? "none"}`}
          hasPopup="listbox"
        />

        {isOpen ? (
          <div
            ref={panelRef}
            className={`chat-mode-popover__panel chat-mode-popover__panel--${openDirection} chat-mode-popover__panel--up`}
            role="listbox"
            aria-label="Agent"
          >
            <div className="chat-mode-popover__title">Agent</div>
            {groups.map((group) => (
              <div className="chat-agent-picker__group" key={group.mode.key}>
                <AgentPickerRow
                  option={group.mode}
                  groups={groups}
                  value={value}
                  onSelect={handleSelect}
                />
                {group.specialties.map((specialty) => (
                  <AgentPickerRow
                    key={specialty.key}
                    option={specialty}
                    groups={groups}
                    value={value}
                    onSelect={handleSelect}
                    nested
                  />
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  },
);
