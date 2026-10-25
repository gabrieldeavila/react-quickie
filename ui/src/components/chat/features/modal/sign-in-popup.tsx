import { SignInPopup } from "@/features/mcp-sign-in/components/SignInPopup";
import { useChatBaseContext } from "../../context/context";

/** Sign-in requests of the chat's project's MCP servers. */
export function ChatSignInPopup() {
  const { projectContext } = useChatBaseContext();
  return <SignInPopup root={projectContext.reference} />;
}
