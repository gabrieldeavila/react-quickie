import { useCallback, useEffect, useState } from "react";
import { deleteInstruction } from "../api/delete-instruction";
import { fetchInstructions } from "../api/fetch-instructions";
import { saveInstruction } from "../api/save-instruction";
import type {
  InstructionInput,
  InstructionScope,
  InstructionSummary,
} from "../domain/instruction.types";

function messageOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

/** The instruction list for `root` (refetched when it changes), plus save and delete. */
export function useInstructions(root: string) {
  const [instructions, setInstructions] = useState<InstructionSummary[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setInstructions(await fetchInstructions(root, signal));
        setError(null);
        setIsLoaded(true);
      } catch (reason) {
        if (signal?.aborted) return;
        setError(messageOf(reason));
      }
    },
    [root],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  /** Saves, then refreshes the list; rethrows so the form can show the error. */
  const save = useCallback(
    async (scope: InstructionScope, id: string, input: InstructionInput) => {
      await saveInstruction(root, scope, id, input);
      await load();
    },
    [load, root],
  );

  const remove = useCallback(
    async (scope: InstructionScope, id: string) => {
      await deleteInstruction(root, scope, id);
      await load();
    },
    [load, root],
  );

  return {
    instructions,
    isLoaded,
    error,
    refresh: () => void load(),
    save,
    remove,
  };
}

export type InstructionsState = ReturnType<typeof useInstructions>;
