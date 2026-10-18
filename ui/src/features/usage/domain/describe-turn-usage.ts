import { formatUsageSummary } from "./format-usage";
import type { ChatMessageMetadata, ExtraUsage } from "./message-usage.types";

const SOURCE_LABELS: Record<ExtraUsage["source"], string> = {
  subagent: "Subagente",
  compaction: "Resumo do contexto",
};

/** The main model's cost: the turn total minus what the extras cost. */
function mainCost(metadata: ChatMessageMetadata): number | undefined {
  if (metadata.costUsd === undefined) return undefined;
  const extrasCost = (metadata.extraUsage ?? []).reduce(
    (total, extra) => total + (extra.costUsd ?? 0),
    0,
  );
  return Math.max(0, metadata.costUsd - extrasCost);
}

/**
 * Footer tooltip, one line per model call:
 * "a:b — 12.3k in · 1.1k out · $0.04" then "Subagente (c:d) — …".
 */
export function describeTurnUsage(metadata: ChatMessageMetadata): string {
  const extras = metadata.extraUsage ?? [];
  if (!metadata.usage || extras.length === 0) return metadata.model;

  const main = `${metadata.model} — ${formatUsageSummary({
    ...metadata.usage,
    costUsd: mainCost(metadata),
  })}`;
  const lines = extras.map(
    (extra) =>
      `${SOURCE_LABELS[extra.source]} (${extra.model}) — ${formatUsageSummary({
        ...extra.usage,
        costUsd: extra.costUsd,
      })}`,
  );
  return [main, ...lines].join("\n");
}
