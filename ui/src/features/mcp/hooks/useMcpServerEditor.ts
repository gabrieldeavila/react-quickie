import { useCallback, useState } from "react";
import {
  emptyServerForm,
  formFromServer,
  formToConfig,
  type McpServerFormValues,
} from "../domain/mcp-server-form";
import type { McpServerView } from "../domain/mcp-server.types";
import { parseServerJson, serverToJson } from "../domain/server-json";
import {
  validateMcpServerForm,
  type McpServerFormErrors,
} from "../domain/validate-mcp-server-form";
import type { McpServersState } from "./useMcpServers";

type Draft = {
  values: McpServerFormValues;
  /** Existing servers keep their name and scope (changing them makes a new entry). */
  isNew: boolean;
  /** "Edit JSON": the raw entry, for fields the form doesn't cover. */
  json: string | null;
};

/** Form state of the add / edit view, including the raw JSON mode. */
export function useMcpServerEditor(state: McpServersState) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<McpServerFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const start = useCallback((next: Draft) => {
    setDraft(next);
    setErrors({});
    setFormError(null);
  }, []);

  const create = useCallback(
    () => start({ values: emptyServerForm(), isNew: true, json: null }),
    [start],
  );

  const edit = useCallback(
    (server: McpServerView) =>
      start({ values: formFromServer(server), isNew: false, json: null }),
    [start],
  );

  const change = useCallback(
    <K extends keyof McpServerFormValues>(
      key: K,
      value: McpServerFormValues[K],
    ) => {
      setDraft((current) =>
        current
          ? { ...current, values: { ...current.values, [key]: value } }
          : current,
      );
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
    [],
  );

  const setJson = useCallback((json: string) => {
    setDraft((current) => (current ? { ...current, json } : current));
  }, []);

  /** Switches between the form and the raw JSON, carrying the edits across. */
  const toggleJson = useCallback(() => {
    if (!draft) return;
    if (draft.json === null) {
      setDraft({ ...draft, json: serverToJson(formToConfig(draft.values)) });
      setFormError(null);
      return;
    }
    const parsed = parseServerJson(draft.json);
    if (!parsed.ok) {
      setFormError(parsed.error);
      return;
    }
    const { name, scope } = draft.values;
    const values = formFromServer({
      name,
      source: scope,
      scope,
      transport: "unknown",
      status: "idle",
      disabled: false,
      config: parsed.config,
    });
    setDraft({ ...draft, values, json: null });
    setFormError(null);
  }, [draft]);

  const cancel = useCallback(() => {
    setDraft(null);
    setFormError(null);
  }, []);

  const submit = useCallback(async () => {
    if (!draft) return;
    const found = validateMcpServerForm(draft.values);
    let config: unknown;
    if (draft.json !== null) {
      // Only the name comes from the form; the API checks the JSON itself.
      const parsed = parseServerJson(draft.json);
      if (!parsed.ok) {
        setFormError(parsed.error);
        return;
      }
      setErrors(found.name ? { name: found.name } : {});
      if (found.name) return;
      config = parsed.config;
    } else {
      setErrors(found);
      if (Object.keys(found).length) return;
      config = formToConfig(draft.values);
    }

    const error = await state.save(draft.values.scope, draft.values.name, config);
    if (error) setFormError(error);
    else setDraft(null);
  }, [draft, state]);

  return {
    draft,
    errors,
    formError,
    isSaving: state.busy === "save",
    create,
    edit,
    change,
    setJson,
    toggleJson,
    cancel,
    submit: () => void submit(),
  };
}

export type McpServerEditor = ReturnType<typeof useMcpServerEditor>;
