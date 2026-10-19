import { describe, expect, it } from "vitest";
import {
  isMacPlatform,
  matchChatShortcut,
  type ShortcutContext,
  type ShortcutKeys,
} from "./match-chat-shortcut";

const noKeys: ShortcutKeys = {
  key: "",
  metaKey: false,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  defaultPrevented: false,
  isComposing: false,
};

const mac: ShortcutContext = {
  isMac: true,
  isResponding: false,
  editorOwnsNewChat: false,
};
const windows: ShortcutContext = { ...mac, isMac: false };

const keys = (overrides: Partial<ShortcutKeys>): ShortcutKeys => ({
  ...noKeys,
  ...overrides,
});

describe("matchChatShortcut — new chat", () => {
  it("uses ⌘N on macOS and Ctrl+N elsewhere", () => {
    expect(matchChatShortcut(keys({ key: "n", metaKey: true }), mac)).toBe("newChat");
    expect(matchChatShortcut(keys({ key: "n", ctrlKey: true }), windows)).toBe("newChat");
  });

  it("ignores the other platform's modifier", () => {
    expect(matchChatShortcut(keys({ key: "n", ctrlKey: true }), mac)).toBeNull();
    expect(matchChatShortcut(keys({ key: "n", metaKey: true }), windows)).toBeNull();
  });

  it("accepts N with Caps Lock on", () => {
    expect(matchChatShortcut(keys({ key: "N", metaKey: true }), mac)).toBe("newChat");
  });

  it("ignores N with Shift or Alt, and plain N", () => {
    expect(matchChatShortcut(keys({ key: "N", metaKey: true, shiftKey: true }), mac)).toBeNull();
    expect(matchChatShortcut(keys({ key: "n", metaKey: true, altKey: true }), mac)).toBeNull();
    expect(matchChatShortcut(keys({ key: "n" }), mac)).toBeNull();
  });

  it("leaves ⌘N to the editor when it owns the shortcut", () => {
    const vscode = { ...mac, editorOwnsNewChat: true };
    expect(matchChatShortcut(keys({ key: "n", metaKey: true }), vscode)).toBeNull();
  });
});

describe("matchChatShortcut — stop response", () => {
  const responding = { ...mac, isResponding: true };

  it("stops the response on Escape while responding", () => {
    expect(matchChatShortcut(keys({ key: "Escape" }), responding)).toBe("stopResponse");
  });

  it("does nothing on Escape when nothing is being generated", () => {
    expect(matchChatShortcut(keys({ key: "Escape" }), mac)).toBeNull();
  });

  it("ignores Escape with a modifier", () => {
    expect(matchChatShortcut(keys({ key: "Escape", shiftKey: true }), responding)).toBeNull();
  });

  it("ignores an Escape that something else already handled", () => {
    expect(
      matchChatShortcut(keys({ key: "Escape", defaultPrevented: true }), responding),
    ).toBeNull();
  });

  it("ignores keys pressed during IME composition", () => {
    expect(
      matchChatShortcut(keys({ key: "Escape", isComposing: true }), responding),
    ).toBeNull();
  });
});

describe("isMacPlatform", () => {
  it("detects macOS and iOS user agents", () => {
    expect(isMacPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe(true);
    expect(isMacPlatform("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe(true);
  });

  it("is false on Windows and Linux", () => {
    expect(isMacPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe(false);
    expect(isMacPlatform("Mozilla/5.0 (X11; Linux x86_64)")).toBe(false);
  });
});
