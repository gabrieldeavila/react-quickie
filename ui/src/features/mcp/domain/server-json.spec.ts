import { describe, expect, it } from "vitest";
import { parseServerJson, serverToJson } from "./server-json";

describe("serverToJson / parseServerJson", () => {
  it("round-trips an entry", () => {
    const config = { command: "db", args: ["--ro"], timeout: 3 };

    expect(parseServerJson(serverToJson(config))).toEqual({
      ok: true,
      config,
    });
    expect(serverToJson(undefined)).toBe("{}");
  });

  it("rejects bad JSON and non-objects", () => {
    expect(parseServerJson("{bad")).toEqual({
      ok: false,
      error: "That isn't valid JSON.",
    });
    expect(parseServerJson("[1]")).toMatchObject({ ok: false });
    expect(parseServerJson('"x"')).toMatchObject({ ok: false });
  });
});
