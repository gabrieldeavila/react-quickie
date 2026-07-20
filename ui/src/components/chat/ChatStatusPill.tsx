type ChatStatusPillProps = {
  label: string;
};

export function ChatStatusPill({ label }: ChatStatusPillProps) {
  return <span className="chat-status-pill">{label}</span>;
}
