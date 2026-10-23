import { describe, expect, it } from "vitest";
import { buildSlashCommands } from "./build-slash-commands";
import { matchSlashCommands } from "./match-slash-commands";

const commands = buildSlashCommands(
  [
    { id: "forms", name: "Forms" },
    { id: "new-api", name: "New API" },
    { id: "settings-sync", name: "Settings sync" },
    { id: "api-conventions", name: "API" },
  ],
  [],
);
const names = (query: string) =>
  matchSlashCommands(commands, query).map(({ name }) => name);

describe("matchSlashCommands", () => {
  it("lists everything for an empty query, built-ins first", () => {
    expect(names("")).toEqual([
      "mcp",
      "instructions",
      "new",
      "settings",
      "auto",
      "forms",
      "new-api",
      "settings-sync",
      "api-conventions",
    ]);
  });

  it("puts prefix matches before substring matches", () => {
    expect(names("api")).toEqual(["api-conventions", "new-api"]);
  });

  it("puts built-ins before instructions within the same rank", () => {
    expect(names("new")).toEqual(["new", "new-api"]);
    expect(names("set")).toEqual(["settings", "settings-sync"]);
  });

  it("is empty when nothing matches", () => {
    expect(names("zzz")).toEqual([]);
  });
});
