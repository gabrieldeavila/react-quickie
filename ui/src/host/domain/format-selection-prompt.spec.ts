import { describe, expect, it } from "vitest";
import {
  appendToComposer,
  formatSelectionPrompt,
} from "./format-selection-prompt";

const selection = {
  file: "src/app.ts",
  startLine: 3,
  endLine: 5,
  languageId: "typescript",
  text: "const a = 1;\n",
};

describe("formatSelectionPrompt", () => {
  it("adds the file, line range and a fenced code block", () => {
    expect(formatSelectionPrompt(selection)).toBe(
      "`src/app.ts:3-5`\n```typescript\nconst a = 1;\n```\n",
    );
  });

  it("uses a single line number and a longer fence when needed", () => {
    expect(
      formatSelectionPrompt({
        ...selection,
        endLine: 3,
        text: "```md\nx\n```",
      }),
    ).toBe("`src/app.ts:3`\n````typescript\n```md\nx\n```\n````\n");
  });
});

describe("appendToComposer", () => {
  it("replaces an empty composer", () => {
    expect(appendToComposer("  ", "new")).toBe("new");
  });

  it("appends after a blank line", () => {
    expect(appendToComposer("explain this\n", "new")).toBe(
      "explain this\n\nnew",
    );
  });
});
