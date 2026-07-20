import { useCallback, useMemo, useState } from "react";

export function useChatComposer() {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("Flash-Lite");

  const hasInput = useMemo(() => input.trim().length > 0, [input]);

  const clearInput = useCallback(() => setInput(""), []);

  return {
    input,
    selectedModel,
    hasInput,
    setInput,
    setSelectedModel,
    clearInput,
  };
}
