import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useCallback } from "react";
import { ChatComposer } from "./chat/ChatComposer";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatMessageList } from "./chat/ChatMessageList";
import { createChatTransport } from "./chat/chatTransport";
import { useChatComposer } from "./chat/useChatComposer";
import "../styles/ChatInterface.css";

export function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { input, hasInput, setInput, clearInput } = useChatComposer();

  const { messages, sendMessage, status } = useChat({
    transport: createChatTransport(),
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSendMessage = useCallback(() => {
    const trimmedInput = input.trim();

    if (!trimmedInput || status !== "ready") return;

    sendMessage({ text: trimmedInput });
    clearInput();
  }, [clearInput, input, sendMessage, status]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  return (
    <main className="chat-shell">
      <section className="chat-container">
        <ChatHeader status={status === "ready" ? "Online" : "Respondendo"} />

        <ChatMessageList messages={messages} isPending={status !== "ready"} />

        <div ref={messagesEndRef} />

        <ChatComposer
          input={input}
          isDisabled={!hasInput || status !== "ready"}
          onInputChange={setInput}
          onSend={handleSendMessage}
          onKeyDown={handleKeyDown}
        />
      </section>
    </main>
  );
}
