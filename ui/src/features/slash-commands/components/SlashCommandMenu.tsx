import { useEffect } from "react";
import { FiCheck, FiEdit3, FiTerminal } from "react-icons/fi";
import type { SlashCommand } from "../domain/slash-command.types";
import { SLASH_MENU_ID, slashOptionId } from "../domain/slash-menu-ids";

function CommandIcon({ command }: { command: SlashCommand }) {
  if (command.kind === "built-in") return <FiTerminal />;
  return command.isActive ? <FiCheck /> : <FiEdit3 />;
}

type Props = {
  matches: SlashCommand[];
  activeIndex: number;
  onRun: (command: SlashCommand) => void;
};

/** Commands matching the slash query; opens upwards above the message box. */
export function SlashCommandMenu({ matches, activeIndex, onRun }: Props) {
  const activeKey = matches[activeIndex]?.key;

  // Keeps the highlighted option visible while moving with the arrows.
  useEffect(() => {
    if (!activeKey) return;
    document
      .getElementById(slashOptionId(activeKey))
      ?.scrollIntoView({ block: "nearest" });
  }, [activeKey]);

  return (
    <div
      id={SLASH_MENU_ID}
      className="slash-menu"
      role="listbox"
      aria-label="Commands"
    >
      {matches.map((command, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={command.key}
            id={slashOptionId(command.key)}
            role="option"
            aria-selected={isActive}
            className={`slash-menu__option ${isActive ? "slash-menu__option--active" : ""}`}
            // mousedown, not click: keeps focus in the textarea.
            onMouseDown={(event) => {
              event.preventDefault();
              onRun(command);
            }}
          >
            <span className="slash-menu__icon" aria-hidden="true">
              <CommandIcon command={command} />
            </span>
            <span className="slash-menu__name">/{command.name}</span>
            <span className="slash-menu__description">
              {command.kind === "instruction"
                ? `${command.isActive ? "Remove" : "Use"} instruction: ${command.description}`
                : command.description}
            </span>
          </div>
        );
      })}
    </div>
  );
}
