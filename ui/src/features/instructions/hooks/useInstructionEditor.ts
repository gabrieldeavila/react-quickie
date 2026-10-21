import { useCallback, useState } from "react";
import { fetchInstruction } from "../api/fetch-instruction";
import { idFromName } from "../domain/instruction-id";
import {
  emptyInstructionForm,
  formForDuplicate,
  formForEdit,
  formToInput,
  hasFormErrors,
  validateInstructionForm,
  type InstructionFormErrors,
  type InstructionFormValues,
} from "../domain/instruction-form";
import type { InstructionSummary } from "../domain/instruction.types";
import type { InstructionsState } from "./useInstructions";

type Draft = {
  values: InstructionFormValues;
  /** New instructions pick their id; existing ones keep it. */
  isNew: boolean;
  /** Until the user edits the id, it follows the name. */
  idTouched: boolean;
};

/** The name also rewrites a derived id, so editing it clears both errors. */
function withoutErrorsFor(
  errors: InstructionFormErrors,
  key: keyof InstructionFormValues,
): InstructionFormErrors {
  const cleared: Array<keyof InstructionFormErrors> =
    key === "name" ? ["name", "id"] : key === "startersText" ? ["starters"] : [];
  if (key === "id" || key === "content") cleared.push(key);
  const next = { ...errors };
  for (const field of cleared) delete next[field];
  return next;
}

function messageOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

/** Create / edit / duplicate / delete flow of the manage dialog. */
export function useInstructionEditor(root: string, state: InstructionsState) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<InstructionFormErrors>({});
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const start = useCallback((next: Draft) => {
    setDraft(next);
    setErrors({});
    setActionError(null);
  }, []);

  const create = useCallback(
    () =>
      start({ values: emptyInstructionForm(), isNew: true, idTouched: false }),
    [start],
  );

  const openFrom = useCallback(
    async (item: InstructionSummary, mode: "edit" | "duplicate") => {
      setBusy(true);
      setActionError(null);
      try {
        const detail = await fetchInstruction(root, item.id);
        start(
          mode === "edit"
            ? { values: formForEdit(detail), isNew: false, idTouched: true }
            : { values: formForDuplicate(detail), isNew: true, idTouched: true },
        );
      } catch (reason) {
        setActionError(messageOf(reason));
      } finally {
        setBusy(false);
      }
    },
    [root, start],
  );

  const change = useCallback(
    <K extends keyof InstructionFormValues>(
      key: K,
      value: InstructionFormValues[K],
    ) => {
      setDraft((current) => {
        if (!current) return current;
        const values = { ...current.values, [key]: value };
        const idTouched = current.idTouched || key === "id";
        if (key === "name" && current.isNew && !idTouched) {
          values.id = idFromName(String(value));
        }
        return { ...current, values, idTouched };
      });
      // An edited field drops its error; the next submit validates again.
      setErrors((current) => withoutErrorsFor(current, key));
    },
    [],
  );

  const cancel = useCallback(() => {
    setDraft(null);
    setErrors({});
    setActionError(null);
  }, []);

  const submit = useCallback(async () => {
    if (!draft) return;
    const found = validateInstructionForm(draft.values);
    setErrors(found);
    if (hasFormErrors(found)) return;

    setBusy(true);
    setActionError(null);
    try {
      const { scope, id } = draft.values;
      await state.save(scope, id, formToInput(draft.values));
      setDraft(null);
    } catch (reason) {
      setActionError(messageOf(reason));
    } finally {
      setBusy(false);
    }
  }, [draft, state]);

  const remove = useCallback(
    async (item: InstructionSummary) => {
      if (!item.editable || item.source === "built-in") return;
      setBusy(true);
      setActionError(null);
      try {
        await state.remove(item.source, item.id);
      } catch (reason) {
        setActionError(messageOf(reason));
      } finally {
        setBusy(false);
      }
    },
    [state],
  );

  return {
    draft,
    errors,
    busy,
    actionError,
    create,
    edit: (item: InstructionSummary) => void openFrom(item, "edit"),
    duplicate: (item: InstructionSummary) => void openFrom(item, "duplicate"),
    change,
    cancel,
    submit: () => void submit(),
    remove: (item: InstructionSummary) => void remove(item),
  };
}

export type InstructionEditor = ReturnType<typeof useInstructionEditor>;
