export const DEFAULT_CONVERSATION_TITLE = "New conversation";

// Default titles saved before the UI switched to English.
const LEGACY_DEFAULT_CONVERSATION_TITLES: readonly string[] = ["Nova conversa"];

const MAX_TITLE_LENGTH = 42;

export const getConversationTitle = (firstUserMessage: string): string => {
  const normalized: string = firstUserMessage.trim().replace(/\s+/g, " ");
  if (!normalized) return DEFAULT_CONVERSATION_TITLE;

  return normalized.length <= MAX_TITLE_LENGTH
    ? normalized
    : `${normalized.slice(0, MAX_TITLE_LENGTH).trimEnd()}…`;
};

export const isDefaultConversationTitle = (title: string): boolean => {
  return (
    title.trim() === "" ||
    title === DEFAULT_CONVERSATION_TITLE ||
    LEGACY_DEFAULT_CONVERSATION_TITLES.includes(title)
  );
};

// A default title becomes the first user message, or the current default
// when there is none yet. Custom titles are kept.
export const getMigratedConversationTitle = (
  title: string,
  firstUserMessage?: string,
): string => {
  if (!isDefaultConversationTitle(title)) return title;
  return getConversationTitle(firstUserMessage ?? "");
};
