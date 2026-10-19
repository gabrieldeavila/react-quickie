import { useCallback } from "react";
import { useChatBaseContext } from "../../context/context";

/** Opens the settings dialog with a draft of the current project context. */
export function useOpenSettings(): () => void {
  const { projectContext, setDraftContext, setIsRootModalOpen } =
    useChatBaseContext();

  return useCallback(() => {
    setDraftContext(projectContext);
    setIsRootModalOpen(true);
  }, [projectContext, setDraftContext, setIsRootModalOpen]);
}
