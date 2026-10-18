import { useCallback } from "react";
import { useChatBaseContext } from "@/components/chat/context/context";
import type { FileReference } from "../domain/parse-file-reference";
import { getHostBridge } from "../host-bridge";

/**
 * Opens a file in the editor, relative to the chat's workspace root.
 * Returns null when the host can't open files (browser).
 */
export function useOpenFile(): ((reference: FileReference) => void) | null {
  const { projectContext } = useChatBaseContext();
  const host = getHostBridge();
  const root = projectContext.reference;

  const openFile = useCallback(
    ({ path, line }: FileReference) => host.openFile(path, line, root),
    [host, root],
  );

  return host.canOpenFiles ? openFile : null;
}
