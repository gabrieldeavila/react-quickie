import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import "../styles/ChatInterface.css";

export function ChatInterface() {
  const [selectedModel, setSelectedModel] = useState("Flash-Lite");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "http://localhost:3000/chat",
      fetch: (url, options) => {
        if (options && options.body) {
          const body = JSON.parse(options.body as string);

          // Mapeia o array de mensagens para o padrão simples { role, content }
          if (body.messages) {
            body.messages = body.messages.map((msg: any) => {
              let contentText = msg.content || "";

              // Se o texto veio escondido dentro de 'parts', joga ele para o 'content'
              if (!contentText && msg.parts && msg.parts.length > 0) {
                contentText = msg.parts
                  .filter((p: any) => p.type === "text")
                  .map((p: any) => p.text)
                  .join("\n");
              }

              return {
                role: msg.role,
                content: contentText,
              };
            });
          }

          // Atualiza o corpo da requisição com o formato corrigido
          options.body = JSON.stringify(body);
        }

        return fetch(url, options);
      },
    }),
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput && status !== "ready") return;

    sendMessage({
      text: trimmedInput,
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const isEmpty = messages.length === 0;

  const renderMessageContent = (
    content: string | Array<{ type: string; text?: string }>,
  ) => {
    if (typeof content === "string") {
      return content;
    }

    return content
      .map((part) => (part.type === "text" ? (part.text ?? "") : ""))
      .join("");
  };

  console.log(messages);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1 className="chat-title">Ready when you are</h1>
      </div>

      <div className="chat-messages">
        {isEmpty ? (
          <div className="empty-state">
            <p>Start a conversation with AI</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}
            >
              <div className="message-content">
                {renderMessageContent(
                  message.parts
                    .filter((part) => part.type === "text")
                    .map((part) => ({
                      type: part.type,
                      text: part.text,
                    })),
                )}
              </div>
            </div>
          ))
        )}
        {status !== "ready" && (
          <div className="message assistant-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-section">
        <div className="input-wrapper">
          <textarea
            className="chat-input"
            placeholder="What's on your mind?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <select
            className="model-selector"
            value={selectedModel}
            onChange={(event) => setSelectedModel(event.target.value)}
          >
            <option value="Flash-Lite">Flash-Lite</option>
            <option value="Standard">Standard</option>
            <option value="Pro">Pro</option>
          </select>
          <button
            className="send-button"
            onClick={handleSendMessage}
            // disabled={!input.trim() || isLoading}
            title="Send message"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
