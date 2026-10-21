import { describe, expect, it } from "vitest";
import { deletionPrompt } from "./deletion-prompt";

describe("deletionPrompt", () => {
  it("names the instruction and where it lives", () => {
    expect(deletionPrompt({ name: "Forms", source: "global" })).toEqual({
      message: 'Delete the global instruction "Forms"?',
      confirmLabel: "Delete",
    });
  });
});
