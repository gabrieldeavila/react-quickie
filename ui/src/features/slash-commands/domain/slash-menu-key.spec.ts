import { describe, expect, it } from "vitest";
import { slashMenuKey } from "./slash-menu-key";

const keys = (key: string, extra: Partial<Parameters<typeof slashMenuKey>[0]> = {}) => ({
  key,
  shiftKey: false,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  isComposing: false,
  ...extra,
});

describe("slashMenuKey", () => {
  it("maps arrows, Enter, Tab and Escape", () => {
    expect(slashMenuKey(keys("ArrowDown"))).toBe("next");
    expect(slashMenuKey(keys("ArrowUp"))).toBe("previous");
    expect(slashMenuKey(keys("Enter"))).toBe("run");
    expect(slashMenuKey(keys("Tab"))).toBe("run");
    expect(slashMenuKey(keys("Escape"))).toBe("close");
  });

  it("leaves other keys, modified keys and IME composition to the textarea", () => {
    expect(slashMenuKey(keys("a"))).toBeNull();
    expect(slashMenuKey(keys("Enter", { shiftKey: true }))).toBeNull();
    expect(slashMenuKey(keys("Tab", { shiftKey: true }))).toBeNull();
    expect(slashMenuKey(keys("Enter", { metaKey: true }))).toBeNull();
    expect(slashMenuKey(keys("Enter", { isComposing: true }))).toBeNull();
  });
});
