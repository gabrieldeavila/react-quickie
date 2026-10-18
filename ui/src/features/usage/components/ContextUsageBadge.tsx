import "@/styles/chat-usage.css";

type ContextUsageBadgeProps = { percent: number | undefined };

const WARNING_PERCENT = 75;

/** "64%" of the context window; turns amber at the share where the API starts compacting. */
export function ContextUsageBadge({ percent }: ContextUsageBadgeProps) {
  if (percent === undefined) return null;
  const warning = percent >= WARNING_PERCENT;

  return (
    <span
      className={`chat-usage-badge ${warning ? "chat-usage-badge--warning" : ""}`}
      title={`Context window used: ${percent}%`}
      aria-label={`Context window used: ${percent}%`}
    >
      {percent}%
    </span>
  );
}
