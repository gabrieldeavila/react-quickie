import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import { matchSlashCommands } from "../domain/match-slash-commands";
import { moveActiveIndex } from "../domain/move-active-index";
import { parseSlashInput } from "../domain/parse-slash-input";
import type { SlashCommand } from "../domain/slash-command.types";
import { slashMenuKey } from "../domain/slash-menu-key";

type UseSlashCommandsInput = {
  input: string;
  commands: SlashCommand[];
  onRun: (command: SlashCommand) => void;
};

/**
 * The command menu above the message box: open while the input is a slash
 * query with matches, keyboard navigation, and running the active command.
 */
export function useSlashCommands({
  input,
  commands,
  onRun,
}: UseSlashCommandsInput) {
  const query = parseSlashInput(input);
  const matches = useMemo(
    () => (query === null ? [] : matchSlashCommands(commands, query)),
    [commands, query],
  );

  // Escape hides the menu until the input changes.
  const [dismissedInput, setDismissedInput] = useState<string | null>(null);
  const [active, setActive] = useState({ query, index: 0 });
  // A new query starts at the first match (render-time reset, no effect).
  if (active.query !== query) setActive({ query, index: 0 });

  const isOpen = matches.length > 0 && dismissedInput !== input;
  const activeIndex = Math.min(active.index, Math.max(matches.length - 1, 0));

  const run = useCallback(
    (command: SlashCommand) => {
      setDismissedInput(null);
      onRun(command);
    },
    [onRun],
  );

  /** Handles the key when the menu is open; returns whether it did. */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>): boolean => {
      if (!isOpen) return false;
      const action = slashMenuKey({
        key: event.key,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        isComposing: event.nativeEvent.isComposing,
      });
      if (!action) return false;

      // Also keeps Escape from reaching the "stop the response" shortcut.
      event.preventDefault();
      if (action === "close") setDismissedInput(input);
      else if (action === "run") run(matches[activeIndex]);
      else {
        const delta = action === "next" ? 1 : -1;
        setActive({
          query,
          index: moveActiveIndex(activeIndex, delta, matches.length),
        });
      }
      return true;
    },
    [activeIndex, input, isOpen, matches, query, run],
  );

  return {
    isOpen,
    matches,
    activeIndex,
    activeKey: isOpen ? matches[activeIndex]?.key : undefined,
    handleKeyDown,
    run,
  };
}

export type SlashCommandsState = ReturnType<typeof useSlashCommands>;
