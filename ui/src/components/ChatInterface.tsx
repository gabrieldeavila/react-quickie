import { type UIMessage, useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatModeEnum } from "../enum/chat.enum";
import "../styles/ChatInterface.css";
import { ChatComposer } from "./chat/ChatComposer";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatMessageList } from "./chat/ChatMessageList";
import { ChatSidebar } from "./chat/ChatSidebar";
import { ProjectCreateModal } from "./chat/ProjectCreateModal";
import { ProjectRootModal } from "./chat/ProjectRootModal";
import { createChatTransport } from "./chat/chatTransport";
import { useChatComposer } from "./chat/useChatComposer";
import { useChatHistory } from "./chat/useChatHistory";

type ProjectContext = {
  reference: string;
  mode: ChatModeEnum;
};

const PROJECT_CONTEXT_STORAGE_KEY = "project-context";
const ACTIVE_CHAT_STORAGE_KEY = "active-chat-conversation-id";
const SIDEBAR_OPEN_STORAGE_KEY = "chat-sidebar-open";
const DEFAULT_PROJECT_CONTEXT: ProjectContext = {
  reference: "/src",
  mode: ChatModeEnum.LANDING_PAGES,
};

function readProjectContext(): ProjectContext {
  if (typeof window === "undefined") return DEFAULT_PROJECT_CONTEXT;

  try {
    const raw = window.localStorage.getItem(PROJECT_CONTEXT_STORAGE_KEY);
    if (!raw) return DEFAULT_PROJECT_CONTEXT;

    const parsed = JSON.parse(raw) as Partial<ProjectContext>;
    return {
      reference:
        typeof parsed.reference === "string" && parsed.reference.trim()
          ? parsed.reference
          : DEFAULT_PROJECT_CONTEXT.reference,
      mode: parsed.mode ? parsed.mode : ChatModeEnum.FORMS,
    };
  } catch {
    return DEFAULT_PROJECT_CONTEXT;
  }
}

function readActiveConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY);
}

function readSidebarOpenState(): boolean {
  if (typeof window === "undefined") return true;
  const storedValue: string | null = window.localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY);
  if (storedValue === null) return true;
  return storedValue === "true";
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

export function ChatInterface() {
  const { input, hasInput, setInput, clearInput } = useChatComposer();
  const [isRootModalOpen, setIsRootModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(readSidebarOpenState);
  const [projectContext, setProjectContext] = useState<ProjectContext>(DEFAULT_PROJECT_CONTEXT);
  const [draftContext, setDraftContext] = useState<ProjectContext>(DEFAULT_PROJECT_CONTEXT);
  const history = useChatHistory();
  const { setActiveConversationId, persistAssistantMessage } = history;

  useEffect(() => {
    const storedContext = readProjectContext();
    setProjectContext(storedContext);
    setDraftContext(storedContext);
  }, []);

  useEffect(() => {
    const storedConversationId = readActiveConversationId();
    if (storedConversationId) setActiveConversationId(storedConversationId);
  }, [setActiveConversationId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, String(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (history.activeConversationId) {
      window.localStorage.setItem(ACTIVE_CHAT_STORAGE_KEY, history.activeConversationId);
      return;
    }
    window.localStorage.removeItem(ACTIVE_CHAT_STORAGE_KEY);
  }, [history.activeConversationId]);

  const transport = useMemo(
    () =>
      createChatTransport({
        projectRoot: projectContext.reference,
        mode: projectContext.mode,
      }),
    [projectContext.mode, projectContext.reference],
  );

  const { messages, setMessages, sendMessage, status } = useChat({
    transport,
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  const handleSendMessage = useCallback(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput || status !== "ready") return;

    void (async (): Promise<void> => {
      if (!history.activeConversationId) {
        const conversationId = await history.createConversation(trimmedInput);
        await history.persistUserMessage(conversationId, trimmedInput);
      } else {
        await history.persistUserMessage(history.activeConversationId, trimmedInput);
      }

      sendMessage({ text: trimmedInput });
      clearInput();
    })();
  }, [clearInput, history, input, sendMessage, status]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleOpenRootModal = useCallback(() => {
    setDraftContext(projectContext);
    setIsRootModalOpen(true);
  }, [projectContext]);

  const assistantPersistedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!history.activeConversationId) {
      setMessages([]);
      return;
    }

    setMessages(history.historyMessages);
    assistantPersistedIdsRef.current = new Set(
      history.historyMessages.filter((message) => message.role === "assistant").map((message) => message.id),
    );
  }, [history.activeConversationId, history.historyMessages, setMessages]);

  useEffect(() => {
    if (status !== "ready" || !history.activeConversationId) return;

    const assistantMessage = [...messages].reverse().find((message) => message.role === "assistant");
    if (!assistantMessage || assistantPersistedIdsRef.current.has(assistantMessage.id)) return;

    const content = getMessageText(assistantMessage).trim();
    if (!content) return;

    void (async (): Promise<void> => {
      await persistAssistantMessage(history.activeConversationId!, content);
      assistantPersistedIdsRef.current.add(assistantMessage.id);
    })();
  }, [history.activeConversationId, messages, persistAssistantMessage, status]);

  const activeConversationTitle = history.conversations.find(
    (conversation) => conversation.id === history.activeConversationId,
  )?.title ?? "Chat";

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

  const handleToggleSidebar = useCallback((): void => {
    setIsSidebarOpen((current: boolean) => !current);
  }, []);

  return (
    <main className="chat-shell">
      <section className={`chat-container ${isSidebarOpen ? "chat-container--sidebar-open" : "chat-container--sidebar-closed"}`}>
        <ChatSidebar
          conversations={history.conversations}
          activeConversationId={history.activeConversationId}
          onCreateConversation={() => void history.createConversation()}
          onDeleteConversation={history.deleteConversation}
          onSelectConversation={history.setActiveConversationId}
          isHydrated={history.isHydrated}
          isOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
        />

        <section className="chat-main">
          <ChatHeader
            title={activeConversationTitle}
            status={status === "ready" ? "Online" : "Respondendo"}
            onOpenProjectRoot={handleOpenRootModal}
            onOpenCreateProject={() => setIsCreateModalOpen(true)}
          />

          <ChatMessageList messages={messages} isPending={status !== "ready"} />

          <ChatComposer
            input={input}
            isDisabled={!hasInput || status !== "ready"}
            onInputChange={setInput}
            onSend={handleSendMessage}
            onKeyDown={handleKeyDown}
          />
        </section>
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

      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onCreated={(value) => {
          setDraftContext((current) => ({ ...current, reference: value }));
          handleSaveRoot();
        }}
        onClose={() => {
          setIsCreateModalOpen(false);
        }}
      />
    </main>
  );
}
