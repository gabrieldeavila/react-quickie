import { describe, expect, it } from "vitest";
import { pickHostRoot } from "./pick-host-root";

describe("pickHostRoot", () => {
  it("keeps the stored root when the host has no folders", () => {
    expect(pickHostRoot("/workspace", [])).toBe("/workspace");
  });

  it("keeps a stored root that is one of the host folders", () => {
    expect(pickHostRoot("/b", ["/a", "/b"])).toBe("/b");
  });

  it("falls back to the first host folder", () => {
    expect(pickHostRoot("/workspace", ["/a", "/b"])).toBe("/a");
  });
});
