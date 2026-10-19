import { useEffect } from "react";
import { getHostBridge } from "../host-bridge";

/** Mirrors the active conversation title into the editor's view title bar. */
export function useHostTitle(title: string): void {
  useEffect(() => {
    getHostBridge().setTitle(title);
  }, [title]);
}
