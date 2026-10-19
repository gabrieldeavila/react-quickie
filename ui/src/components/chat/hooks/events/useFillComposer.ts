import { useCallback } from "react";
import { CHAT_INPUT_ID } from "../../features/main/composer/chat-input-id";
import { useChatBaseContext } from "../../context/context";

/** Puts text in the message box and focuses it, with the cursor at the end. Doesn't send. */
export function useFillComposer() {
  const { setInput } = useChatBaseContext();

  return useCallback(
    (text: string) => {
      setInput(text);
      requestAnimationFrame(() => focusAtEnd(text.length));
    },
    [setInput],
  );
}

function focusAtEnd(position: number) {
  const textarea = document.getElementById(CHAT_INPUT_ID);
  if (!(textarea instanceof HTMLTextAreaElement)) return;
  textarea.focus();
  textarea.setSelectionRange(position, position);
}
