import type { ChatConversation } from "./chat-db.interface";

export type ChatSidebarProps = {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  onCreateConversation: () => void;
  onSelectConversation: (conversationId: string | null) => void;
  onDeleteConversation: (conversationId: string) => Promise<void>;
  isHydrated: boolean;
  isOpen: boolean;
  onToggleSidebar: () => void;
};
