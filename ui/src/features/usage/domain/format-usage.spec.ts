import { describe, expect, it } from "vitest";
import { formatCost, formatTokens, formatUsageSummary } from "./format-usage";

describe("format-usage", () => {
  it("formats token counts", () => {
    expect(formatTokens(950)).toBe("950");
    expect(formatTokens(12_340)).toBe("12.3k");
    expect(formatTokens(1_250_000)).toBe("1.25M");
  });

  it("formats costs", () => {
    expect(formatCost(0)).toBe("$0");
    expect(formatCost(0.00001)).toBe("<$0.0001");
    expect(formatCost(0.0031)).toBe("$0.0031");
    expect(formatCost(0.041)).toBe("$0.04");
  });

  it("builds the footer text", () => {
    expect(
      formatUsageSummary({
        inputTokens: 12_300,
        outputTokens: 1_100,
        costUsd: 0.04,
      }),
    ).toBe("12.3k in · 1.1k out · $0.04");
    expect(formatUsageSummary({ inputTokens: 5, outputTokens: 1 })).toBe(
      "5 in · 1 out",
    );
  });
});
