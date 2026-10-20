import { InstructionsDialog } from "@/features/instructions/components/InstructionsDialog";
import { useChatBaseContext } from "../../context/context";
import { CHAT_INPUT_ID } from "../main/composer/chat-input-id";

/** The manage-instructions dialog, bound to the chat's project and list. */
export function ChatModalInstructions() {
  const {
    isInstructionsDialogOpen,
    setIsInstructionsDialogOpen,
    projectContext,
    instructions,
  } = useChatBaseContext();

  if (!isInstructionsDialogOpen) return null;

  const close = () => {
    setIsInstructionsDialogOpen(false);
    requestAnimationFrame(() => document.getElementById(CHAT_INPUT_ID)?.focus());
  };

  return (
    <InstructionsDialog
      root={projectContext.reference}
      state={instructions}
      onClose={close}
    />
  );
}
