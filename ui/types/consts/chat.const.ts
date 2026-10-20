import type { ProjectContext } from "../interface/chat.interface";

export const PROJECT_CONTEXT_STORAGE_KEY: string = "project-context";
export const ACTIVE_CHAT_STORAGE_KEY: string = "active-chat-conversation-id";

export const DEFAULT_PROJECT_CONTEXT: ProjectContext = {
  reference: "/workspace",
};
