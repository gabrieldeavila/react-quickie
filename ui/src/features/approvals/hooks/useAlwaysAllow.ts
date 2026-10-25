import { useCallback, useMemo, useState } from "react";
import { saveAlwaysAllow } from "../api/save-always-allow";
import type { AlwaysAllowOption } from "../domain/always-allow.types";
import { alwaysAllowOptions } from "../domain/rule-from-approval";

type Input = {
  root: string;
  toolName: string;
  input: unknown;
  /** Approves the current call once the choice is saved. */
  approve: () => void;
};

/** The card's "Always allow" choices: save the rule, then approve this call. */
export function useAlwaysAllow({ root, toolName, input, approve }: Input) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const options = useMemo(
    () => alwaysAllowOptions(toolName, input),
    [toolName, input],
  );

  const choose = useCallback(
    async (option: AlwaysAllowOption) => {
      setIsSaving(true);
      setError(null);
      try {
        await saveAlwaysAllow(root, option.request);
        approve();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : String(cause));
      } finally {
        setIsSaving(false);
      }
    },
    [approve, root],
  );

  return { options, choose, isSaving, error };
}
