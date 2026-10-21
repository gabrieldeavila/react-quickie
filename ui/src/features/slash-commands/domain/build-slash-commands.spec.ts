import { describe, expect, it } from "vitest";
import { buildSlashCommands } from "./build-slash-commands";

describe("buildSlashCommands", () => {
  it("lists the built-ins first, then one toggle per instruction", () => {
    const commands = buildSlashCommands(
      [
        { id: "forms", name: "Forms" },
        { id: "landing-pages", name: "Landing pages" },
      ],
      ["forms"],
    );

    expect(commands.map(({ name }) => name)).toEqual([
      "mcp",
      "instructions",
      "new",
      "settings",
      "forms",
      "landing-pages",
    ]);
    expect(commands[4]).toEqual({
      kind: "instruction",
      key: "instruction:forms",
      name: "forms",
      description: "Forms",
      isActive: true,
    });
    expect(commands[5]).toMatchObject({ isActive: false });
  });

  it("keeps keys unique even when an instruction reuses a built-in name", () => {
    const keys = buildSlashCommands([{ id: "new", name: "New" }], []).map(
      ({ key }) => key,
    );

    expect(new Set(keys).size).toBe(keys.length);
  });
});
