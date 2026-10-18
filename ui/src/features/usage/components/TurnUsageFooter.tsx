import { describeTurnUsage } from "../domain/describe-turn-usage";
import { formatUsageSummary } from "../domain/format-usage";
import { readMessageUsage } from "../domain/read-message-usage";
import { turnTokenTotals } from "../domain/turn-token-totals";
import "@/styles/chat-usage.css";

type TurnUsageFooterProps = {
  message: { role: string; metadata?: unknown };
};

/** "12.3k in · 1.1k out · $0.04" under a finished assistant turn. */
export function TurnUsageFooter({ message }: TurnUsageFooterProps) {
  const metadata = readMessageUsage(message);
  if (!metadata?.usage) return null;

  return (
    <footer className="chat-turn-usage" title={describeTurnUsage(metadata)}>
      {formatUsageSummary({
        ...turnTokenTotals(metadata),
        costUsd: metadata.costUsd,
      })}
    </footer>
  );
}
