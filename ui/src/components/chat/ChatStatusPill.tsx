import type { ChatStatusPillProps } from "../../types/interface/chat-status-pill.interface";

export function ChatStatusPill({ label }: ChatStatusPillProps) {
  return <span className="chat-status-pill">{label}</span>;
}
