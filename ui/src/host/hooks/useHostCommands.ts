import { useEffect, useRef } from "react";
import type { HostCommand } from "../domain/host-messages";
import { getHostBridge } from "../host-bridge";

export type HostCommandHandlers = Record<HostCommand, () => void>;

/** Runs the editor's view title-bar buttons ("New chat", "History", "Settings"). */
export function useHostCommands(handlers: HostCommandHandlers): void {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(
    () =>
      getHostBridge().onMessage((message) => {
        if (message.type === "runCommand") handlersRef.current[message.command]();
      }),
    [],
  );
}
