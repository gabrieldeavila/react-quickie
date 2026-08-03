import { type UIMessage, useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgentFocusEnum, AgentSpecialtyEnum } from "../enum/agent.enum";
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
  focus: AgentFocusEnum;
  specialty: AgentSpecialtyEnum;
};

const PROJECT_CONTEXT_STORAGE_KEY: string = "project-context";
const ACTIVE_CHAT_STORAGE_KEY: string = "active-chat-conversation-id";
const SIDEBAR_OPEN_STORAGE_KEY: string = "chat-sidebar-open";
const DEFAULT_PROJECT_CONTEXT: ProjectContext = {
  reference: "/src",
  focus: AgentFocusEnum.AGNOSTIC,
  specialty: AgentSpecialtyEnum.NONE,
};

function isAgentFocus(value: unknown): value is AgentFocusEnum {
  return (
    value === AgentFocusEnum.FRONTEND ||
    value === AgentFocusEnum.BACKEND ||
    value === AgentFocusEnum.AGNOSTIC
  );
}

function isAgentSpecialty(value: unknown): value is AgentSpecialtyEnum {
  return (
    value === AgentSpecialtyEnum.NONE ||
    value === AgentSpecialtyEnum.LANDING_PAGES ||
    value === AgentSpecialtyEnum.FORMS
  );
}

function normalizeStoredFocus(value: unknown): AgentFocusEnum {
  if (typeof value === "number") {
    return (
      [
        AgentFocusEnum.FRONTEND,
        AgentFocusEnum.BACKEND,
        AgentFocusEnum.AGNOSTIC,
      ][value] ?? DEFAULT_PROJECT_CONTEXT.focus
    );
  }
  return isAgentFocus(value) ? value : DEFAULT_PROJECT_CONTEXT.focus;
}

function readProjectContext(): ProjectContext {
  if (typeof window === "undefined") return DEFAULT_PROJECT_CONTEXT;

  try {
    const raw: string | null = window.localStorage.getItem(
      PROJECT_CONTEXT_STORAGE_KEY,
    );
    if (!raw) return DEFAULT_PROJECT_CONTEXT;

    const parsed: Partial<ProjectContext & { focus: unknown }> =
      JSON.parse(raw);
    return {
      reference:
        typeof parsed.reference === "string" && parsed.reference.trim()
          ? parsed.reference
          : DEFAULT_PROJECT_CONTEXT.reference,
      focus: normalizeStoredFocus(parsed.focus),
      specialty: isAgentSpecialty(parsed.specialty)
        ? parsed.specialty
        : DEFAULT_PROJECT_CONTEXT.specialty,
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
  const storedValue: string | null = window.localStorage.getItem(
    SIDEBAR_OPEN_STORAGE_KEY,
  );
  return storedValue === null ? true : storedValue === "true";
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

function serializeProjectContext(context: ProjectContext): string {
  return JSON.stringify({
    reference: context.reference,
    focus: context.focus,
    specialty: context.specialty,
  });
}

export function ChatInterface(): React.JSX.Element {
  const { input, hasInput, setInput, clearInput } = useChatComposer();
  const [isRootModalOpen, setIsRootModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] =
    useState<boolean>(readSidebarOpenState);
  const [projectContext, setProjectContext] =
    useState<ProjectContext>(readProjectContext);
  const [draftContext, setDraftContext] =
    useState<ProjectContext>(readProjectContext);
  const history = useChatHistory();
  const { setActiveConversationId, persistAssistantMessage } = history;
  const pendingConversationIdRef = useRef<string | null>(null);
  const assistantPersistedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const storedConversationId: string | null = readActiveConversationId();
    if (storedConversationId) setActiveConversationId(storedConversationId);
  }, [setActiveConversationId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      SIDEBAR_OPEN_STORAGE_KEY,
      String(isSidebarOpen),
    );
  }, [isSidebarOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      PROJECT_CONTEXT_STORAGE_KEY,
      serializeProjectContext(projectContext),
    );
  }, [projectContext]);

  useEffect(() => {
    setDraftContext(projectContext);
  }, [projectContext]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (history.activeConversationId) {
      window.localStorage.setItem(
        ACTIVE_CHAT_STORAGE_KEY,
        history.activeConversationId,
      );
      return;
    }
    window.localStorage.removeItem(ACTIVE_CHAT_STORAGE_KEY);
  }, [history.activeConversationId]);

  const transport = useMemo(
    () =>
      createChatTransport({
        projectRoot: projectContext.reference,
        focus: projectContext.focus,
        specialty: projectContext.specialty,
      }),
    [projectContext.focus, projectContext.reference, projectContext.specialty],
  );

  const { messages, setMessages, sendMessage, status } = useChat({
    transport,
    onError: (error: Error) => {
      pendingConversationIdRef.current = null;
      console.error("Error sending message:", error);
    },
  });

  const isChatPending: boolean =
    status === "submitted" || status === "streaming";
  const chatStatusLabel: string =
    status === "error" ? "Erro" : status === "ready" ? "Online" : "Respondendo";

  const handleCreateConversation = useCallback((): void => {
    void (async (): Promise<void> => {
      pendingConversationIdRef.current = null;
      assistantPersistedIdsRef.current.clear();
      clearInput();
      setMessages([]);
      await history.createConversation();
    })();
  }, [clearInput, history, setMessages]);

  const handleSendMessage = useCallback((): void => {
    const trimmedInput: string = input.trim();
    if (!trimmedInput || status !== "ready") return;
    void (async (): Promise<void> => {
      const conversationId: string =
        history.activeConversationId ??
        (await history.createConversation(trimmedInput));
      pendingConversationIdRef.current = conversationId;
      await history.persistUserMessage(conversationId, trimmedInput);
      sendMessage({ text: trimmedInput });
      clearInput();
    })();
  }, [clearInput, history, input, sendMessage, status]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const handleOpenRootModal = useCallback((): void => {
    setDraftContext(projectContext);
    setIsRootModalOpen(true);
  }, [projectContext]);

  useEffect(() => {
    if (!history.activeConversationId) {
      setMessages([]);
      return;
    }
    setMessages(history.historyMessages);
    assistantPersistedIdsRef.current = new Set([
      ...assistantPersistedIdsRef.current,
      ...history.historyMessages
        .filter((message) => message.role === "assistant")
        .map((message) => message.id),
    ]);
  }, [history.activeConversationId, history.historyMessages, setMessages]);

  useEffect(() => {
    if (status !== "ready") return;
    const assistantMessage: UIMessage | undefined = [...messages]
      .reverse()
      .find((message) => message.role === "assistant");
    if (
      !assistantMessage ||
      assistantPersistedIdsRef.current.has(assistantMessage.id)
    )
      return;
    const content: string = getMessageText(assistantMessage).trim();
    if (!content) return;
    const assistantMessageId: string = assistantMessage.id;
    if (assistantPersistedIdsRef.current.has(assistantMessageId)) return;
    assistantPersistedIdsRef.current.add(assistantMessageId);
    const targetConversationId: string | null =
      pendingConversationIdRef.current;
    if (!targetConversationId) {
      assistantPersistedIdsRef.current.delete(assistantMessageId);
      return;
    }
    void (async (): Promise<void> => {
      try {
        await persistAssistantMessage(targetConversationId, content);
      } catch (error) {
        assistantPersistedIdsRef.current.delete(assistantMessageId);
        console.error("Error persisting assistant message:", error);
        return;
      }
      if (pendingConversationIdRef.current === targetConversationId) {
        pendingConversationIdRef.current = null;
      }
    })();
  }, [messages, persistAssistantMessage, status, history.activeConversationId]);

  const activeConversationTitle: string =
    history.conversations.find(
      (conversation) => conversation.id === history.activeConversationId,
    )?.title ?? "Chat";

  const handleSaveRoot = useCallback((): void => {
    const nextContext: ProjectContext = {
      reference:
        draftContext.reference.trim() || DEFAULT_PROJECT_CONTEXT.reference,
      focus: draftContext.focus,
      specialty: draftContext.specialty,
    };
    setProjectContext(nextContext);
    setIsRootModalOpen(false);
  }, [draftContext.focus, draftContext.reference, draftContext.specialty]);

  const handleFocusChange = useCallback((value: AgentFocusEnum): void => {
    setProjectContext((current: ProjectContext) => ({
      ...current,
      focus: value,
    }));
    setDraftContext((current: ProjectContext) => ({
      ...current,
      focus: value,
    }));
  }, []);

  const handleSpecialtyChange = useCallback(
    (value: AgentSpecialtyEnum): void => {
      setProjectContext((current: ProjectContext) => ({
        ...current,
        specialty: value,
      }));
      setDraftContext((current: ProjectContext) => ({
        ...current,
        specialty: value,
      }));
    },
    [],
  );

  const handleToggleSidebar = useCallback((): void => {
    setIsSidebarOpen((current: boolean) => !current);
  }, []);

  return (
    <main className="chat-shell">
      <section
        className={`chat-container ${isSidebarOpen ? "chat-container--sidebar-open" : "chat-container--sidebar-closed"}`}
      >
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
            status={chatStatusLabel}
            focus={projectContext.focus}
            specialty={projectContext.specialty}
            onFocusChange={handleFocusChange}
            onSpecialtyChange={handleSpecialtyChange}
            onOpenProjectRoot={handleOpenRootModal}
            onOpenCreateProject={() => setIsCreateModalOpen(true)}
            onCreateConversation={handleCreateConversation}
          />
          <ChatMessageList messages={messages} isPending={isChatPending} />
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
        mode={draftContext.focus}
        specialty={draftContext.specialty}
        onModeChange={(value: AgentFocusEnum) => {
          setDraftContext((current: ProjectContext) => ({
            ...current,
            focus: value,
          }));
        }}
        onSpecialtyChange={(value: AgentSpecialtyEnum) => {
          setDraftContext((current: ProjectContext) => ({
            ...current,
            specialty: value,
          }));
        }}
        value={draftContext.reference}
        onChange={(value: string) =>
          setDraftContext((current: ProjectContext) => ({
            ...current,
            reference: value,
          }))
        }
        onClose={() => setIsRootModalOpen(false)}
        onSave={handleSaveRoot}
      />
      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(path: string) => {
          setIsCreateModalOpen(false);
          console.log("Create project:", path);
        }}
      />
    </main>
  );
}
