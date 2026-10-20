import { McpDialog } from "@/features/mcp/components/McpDialog";
import { useChatBaseContext } from "../../context/context";
import { CHAT_INPUT_ID } from "../main/composer/chat-input-id";

/** The MCP dialog for the chat's project; closing it returns to the message box. */
export function ChatModalMcp() {
  const { isMcpDialogOpen, setIsMcpDialogOpen, projectContext } =
    useChatBaseContext();

  if (!isMcpDialogOpen) return null;

  const close = () => {
    setIsMcpDialogOpen(false);
    requestAnimationFrame(() => document.getElementById(CHAT_INPUT_ID)?.focus());
  };

  return <McpDialog root={projectContext.reference} onClose={close} />;
}
