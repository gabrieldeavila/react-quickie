import { useCallback, useMemo, useState } from "react";

export function useChatComposer() {
  const [input, setInput] = useState("");

  const hasInput = useMemo(() => input.trim().length > 0, [input]);

  const clearInput = useCallback(() => setInput(""), []);

  return useMemo(
    () => ({
      input,
      hasInput,
      setInput,
      clearInput,
    }),
    [clearInput, hasInput, input],
  );
}
