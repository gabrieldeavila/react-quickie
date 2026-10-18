/** 950 → "950", 12_340 → "12.3k", 1_250_000 → "1.25M". */
export function formatTokens(count: number): string {
  if (count < 1_000) return String(count);
  if (count < 1_000_000) return `${(count / 1_000).toFixed(1)}k`;
  return `${(count / 1_000_000).toFixed(2)}M`;
}

/** USD with enough precision for cheap turns: "$0.04", "$0.0031", "<$0.0001". */
export function formatCost(usd: number): string {
  if (usd === 0) return "$0";
  if (usd < 0.0001) return "<$0.0001";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}

type UsageSummary = {
  inputTokens: number;
  outputTokens: number;
  costUsd?: number;
};

/** "12.3k in · 1.1k out · $0.04" (cost left out when unknown). */
export function formatUsageSummary({
  inputTokens,
  outputTokens,
  costUsd,
}: UsageSummary): string {
  const parts = [
    `${formatTokens(inputTokens)} in`,
    `${formatTokens(outputTokens)} out`,
  ];
  if (costUsd !== undefined) parts.push(formatCost(costUsd));
  return parts.join(" · ");
}
