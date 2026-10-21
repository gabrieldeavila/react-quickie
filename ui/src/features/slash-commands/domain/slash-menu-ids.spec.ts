import { describe, expect, it } from "vitest";
import { slashOptionId } from "./slash-menu-ids";

describe("slashOptionId", () => {
  it("makes a valid, unique-per-key DOM id", () => {
    expect(slashOptionId("built-in:mcp")).toBe("slash-option-built-in-mcp");
    expect(slashOptionId("instruction:landing-pages")).toBe(
      "slash-option-instruction-landing-pages",
    );
  });
});
