import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useCallback, useState } from "react";
import { ChatComposer } from "./chat/ChatComposer";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatMessageList } from "./chat/ChatMessageList";
import { ProjectRootModal } from "./chat/ProjectRootModal";
import { createChatTransport } from "./chat/chatTransport";
import { useChatComposer } from "./chat/useChatComposer";
import "../styles/ChatInterface.css";

type ChatMode = "Landing Pages" | "Forms";

type ProjectContext = {
  reference: string;
  mode: ChatMode;
};

const PROJECT_CONTEXT_STORAGE_KEY = "project-context";
const DEFAULT_PROJECT_CONTEXT: ProjectContext = {
  reference: "/src",
  mode: "Landing Pages",
};

function readProjectContext(): ProjectContext {
  if (typeof window === "undefined") return DEFAULT_PROJECT_CONTEXT;

  try {
    const raw = window.localStorage.getItem(PROJECT_CONTEXT_STORAGE_KEY);
    if (!raw) return DEFAULT_PROJECT_CONTEXT;

    const parsed = JSON.parse(raw) as Partial<ProjectContext>;
    return {
      reference: typeof parsed.reference === "string" && parsed.reference.trim() ? parsed.reference : DEFAULT_PROJECT_CONTEXT.reference,
      mode: parsed.mode === "Forms" ? "Forms" : "Landing Pages",
    };
  } catch {
    return DEFAULT_PROJECT_CONTEXT;
  }
}

export function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { input, hasInput, setInput, clearInput } = useChatComposer();
  const [isRootModalOpen, setIsRootModalOpen] = useState(false);
  const [projectContext, setProjectContext] = useState<ProjectContext>(DEFAULT_PROJECT_CONTEXT);
  const [draftContext, setDraftContext] = useState<ProjectContext>(DEFAULT_PROJECT_CONTEXT);

  useEffect(() => {
    const storedContext = readProjectContext();
    setProjectContext(storedContext);
    setDraftContext(storedContext);
  }, []);

  const transport = createChatTransport({
    projectRoot: projectContext.reference,
    mode: projectContext.mode,
  });

  const { messages, sendMessage, status } = useChat({
    transport,
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

  const handleOpenRootModal = useCallback(() => {
    setDraftContext(projectContext);
    setIsRootModalOpen(true);
  }, [projectContext]);

  const handleSaveRoot = useCallback(() => {
    const nextContext = {
      reference: draftContext.reference.trim() || DEFAULT_PROJECT_CONTEXT.reference,
      mode: draftContext.mode,
    };

    setProjectContext(nextContext);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROJECT_CONTEXT_STORAGE_KEY, JSON.stringify(nextContext));
    }

    setIsRootModalOpen(false);
  }, [draftContext]);

  return (
    <main className="chat-shell">
      <section className="chat-container">
        <ChatHeader title="Chat" status={status === "ready" ? "Online" : "Respondendo"} onOpenProjectRoot={handleOpenRootModal} />

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

      <ProjectRootModal
        isOpen={isRootModalOpen}
        mode={draftContext.mode}
        onModeChange={(value) => setDraftContext((current) => ({ ...current, mode: value }))}
        value={draftContext.reference}
        onChange={(value) => setDraftContext((current) => ({ ...current, reference: value }))}
        onClose={() => setIsRootModalOpen(false)}
        onSave={handleSaveRoot}
      />
    </main>
  );
}
