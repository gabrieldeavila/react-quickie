import { useCallback, useMemo } from "react";
import { buildSlashCommands } from "@/features/slash-commands/domain/build-slash-commands";
import type { SlashCommand } from "@/features/slash-commands/domain/slash-command.types";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../../context/context";
import { useOpenSettings } from "./useOpenSettings";

/** The menu's commands and what each one does; running one clears the input. */
export function useSlashCommandActions() {
  const {
    instructions,
    instructionSelection,
    setInput,
    setIsInstructionsDialogOpen,
    setIsMcpDialogOpen,
  } = useChatBaseContext();
  const { handleCreateConversation } = useChatServicesContext();
  const openSettings = useOpenSettings();

  const commands = useMemo(
    () =>
      buildSlashCommands(
        instructions.instructions,
        instructionSelection.selectedIds,
      ),
    [instructions.instructions, instructionSelection.selectedIds],
  );

  const run = useCallback(
    (command: SlashCommand) => {
      setInput("");
      if (command.kind === "instruction") {
        instructionSelection.toggle(command.name);
        return;
      }
      switch (command.name) {
        case "mcp":
          setIsMcpDialogOpen(true);
          return;
        case "instructions":
          setIsInstructionsDialogOpen(true);
          return;
        case "new":
          void handleCreateConversation();
          return;
        case "settings":
          openSettings();
          return;
      }
    },
    [
      handleCreateConversation,
      instructionSelection,
      openSettings,
      setInput,
      setIsInstructionsDialogOpen,
      setIsMcpDialogOpen,
    ],
  );

  return { commands, run };
}
