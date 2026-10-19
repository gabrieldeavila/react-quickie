import { describe, expect, it } from "vitest";
import { nextSwitcherFocus, SEARCH_POSITION } from "./next-switcher-focus";

describe("nextSwitcherFocus", () => {
  it("moves from the search box to the first row on ArrowDown", () => {
    expect(nextSwitcherFocus("ArrowDown", SEARCH_POSITION, 3)).toBe(0);
  });

  it("moves down one row and stops at the last one", () => {
    expect(nextSwitcherFocus("ArrowDown", 0, 3)).toBe(1);
    expect(nextSwitcherFocus("ArrowDown", 2, 3)).toBe(2);
  });

  it("moves up one row, and from the first row back to the search box", () => {
    expect(nextSwitcherFocus("ArrowUp", 2, 3)).toBe(1);
    expect(nextSwitcherFocus("ArrowUp", 0, 3)).toBe(SEARCH_POSITION);
  });

  it("leaves ArrowUp in the search box alone", () => {
    expect(nextSwitcherFocus("ArrowUp", SEARCH_POSITION, 3)).toBeNull();
  });

  it("jumps to the first and last row with Home and End", () => {
    expect(nextSwitcherFocus("Home", 2, 3)).toBe(0);
    expect(nextSwitcherFocus("End", 0, 3)).toBe(2);
  });

  it("keeps Home and End for the caret while in the search box", () => {
    expect(nextSwitcherFocus("Home", SEARCH_POSITION, 3)).toBeNull();
    expect(nextSwitcherFocus("End", SEARCH_POSITION, 3)).toBeNull();
  });

  it("ignores every key when there are no rows", () => {
    expect(nextSwitcherFocus("ArrowDown", SEARCH_POSITION, 0)).toBeNull();
  });

  it("ignores keys that aren't for navigation", () => {
    expect(nextSwitcherFocus("a", 0, 3)).toBeNull();
    expect(nextSwitcherFocus("Enter", 0, 3)).toBeNull();
  });
});
