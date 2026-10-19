import { describe, expect, it } from "vitest";
import type { ChatConversation } from "~types/interface/chat-db.interface";
import {
  filterConversations,
  normalizeSearchText,
} from "./filter-conversations";

function conversation(
  id: string,
  title: string,
  lastMessageAt: number,
  updatedAt: number = lastMessageAt,
): ChatConversation {
  return { id, title, createdAt: 0, updatedAt, lastMessageAt };
}

const LOGIN = conversation("login", "Build a login form", 300);
const LANDING = conversation("landing", "Landing page for Café Azul", 100);
const API = conversation("api", "REST API for orders", 200);

describe("normalizeSearchText", () => {
  it("lowercases, strips accents and collapses whitespace", () => {
    expect(normalizeSearchText("  Café   AZUL ")).toBe("cafe azul");
  });
});

describe("filterConversations", () => {
  it("returns every conversation, most recent first, for an empty query", () => {
    const result = filterConversations([LANDING, LOGIN, API], "   ");
    expect(result.map((item) => item.id)).toEqual(["login", "api", "landing"]);
  });

  it("matches titles case- and accent-insensitively", () => {
    expect(filterConversations([LOGIN, LANDING], "CAFE")).toEqual([LANDING]);
  });

  it("requires every word of the query, in any order", () => {
    expect(filterConversations([LOGIN, LANDING, API], "form login")).toEqual([
      LOGIN,
    ]);
    expect(filterConversations([LOGIN, LANDING, API], "login api")).toEqual([]);
  });

  it("breaks recency ties by the last update", () => {
    const older = conversation("older", "Chat", 50, 10);
    const newer = conversation("newer", "Chat", 50, 20);
    expect(filterConversations([older, newer], "").map((c) => c.id)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("does not mutate the input list", () => {
    const input = [LANDING, LOGIN];
    filterConversations(input, "");
    expect(input).toEqual([LANDING, LOGIN]);
  });
});
