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
      "auto",
      "forms",
      "landing-pages",
    ]);
    expect(commands[5]).toEqual({
      kind: "instruction",
      key: "instruction:forms",
      name: "forms",
      description: "Forms",
      isActive: true,
    });
    expect(commands[6]).toMatchObject({ isActive: false });
  });

  it("describes /auto by what it will do", () => {
    const describe = (autoApprove: boolean) =>
      buildSlashCommands([], [], autoApprove).find(
        ({ name }) => name === "auto",
      )?.description;

    expect(describe(false)).toMatch(/^Auto-approve/);
    expect(describe(true)).toBe("Turn auto-approve off");
  });

  it("keeps keys unique even when an instruction reuses a built-in name", () => {
    const keys = buildSlashCommands([{ id: "new", name: "New" }], []).map(
      ({ key }) => key,
    );

    expect(new Set(keys).size).toBe(keys.length);
  });
});
