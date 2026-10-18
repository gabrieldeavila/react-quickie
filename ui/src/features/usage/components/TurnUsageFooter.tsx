import { formatUsageSummary } from "../domain/format-usage";
import { readMessageUsage } from "../domain/read-message-usage";
import "@/styles/chat-usage.css";

type TurnUsageFooterProps = {
  message: { role: string; metadata?: unknown };
};

/** "12.3k in · 1.1k out · $0.04" under a finished assistant turn. */
export function TurnUsageFooter({ message }: TurnUsageFooterProps) {
  const metadata = readMessageUsage(message);
  if (!metadata?.usage) return null;

  return (
    <footer className="chat-turn-usage" title={metadata.model}>
      {formatUsageSummary({ ...metadata.usage, costUsd: metadata.costUsd })}
    </footer>
  );
}
