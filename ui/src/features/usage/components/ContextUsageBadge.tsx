import "@/styles/chat-usage.css";

type ContextUsageBadgeProps = { percent: number | undefined };

const WARNING_PERCENT = 75;

/** "context 64%"; turns amber at the share where the API starts compacting. */
export function ContextUsageBadge({ percent }: ContextUsageBadgeProps) {
  if (percent === undefined) return null;
  const warning = percent >= WARNING_PERCENT;

  return (
    <span
      className={`chat-usage-badge ${warning ? "chat-usage-badge--warning" : ""}`}
      title="Share of the model's context window used by the conversation"
    >
      context {percent}%
    </span>
  );
}
