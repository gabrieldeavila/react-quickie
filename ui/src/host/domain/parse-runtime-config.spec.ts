import { describe, expect, it } from "vitest";
import { parseRuntimeConfig } from "./parse-runtime-config";

describe("parseRuntimeConfig", () => {
  it("falls back to the browser setup when nothing is injected", () => {
    expect(parseRuntimeConfig(undefined, "http://localhost:3000")).toEqual({
      apiUrl: "http://localhost:3000",
      token: null,
      roots: [],
      host: "browser",
    });
  });

  it("reads the config injected by the VSCode extension", () => {
    const config = parseRuntimeConfig(
      {
        apiUrl: "http://127.0.0.1:51234/",
        token: "abc",
        roots: ["/work/a", "", "/work/b"],
        host: "vscode",
      },
      "http://localhost:3000",
    );

    expect(config).toEqual({
      apiUrl: "http://127.0.0.1:51234",
      token: "abc",
      roots: ["/work/a", "/work/b"],
      host: "vscode",
    });
  });

  it("accepts a single `root` and ignores unknown hosts", () => {
    const config = parseRuntimeConfig(
      { root: "/work/a", host: "electron", token: 42 },
      "http://api",
    );

    expect(config.roots).toEqual(["/work/a"]);
    expect(config.host).toBe("browser");
    expect(config.token).toBeNull();
  });
});
