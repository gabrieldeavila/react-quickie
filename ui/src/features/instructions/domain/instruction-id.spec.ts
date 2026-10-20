import { describe, expect, it } from "vitest";
import { idFromName, isValidInstructionId } from "./instruction-id";

describe("idFromName", () => {
  it("turns a name into a dashed lowercase id", () => {
    expect(idFromName("Landing Pages (v2)")).toBe("landing-pages-v2");
    expect(idFromName("  API: conventions!  ")).toBe("api-conventions");
  });

  it("folds accents", () => {
    expect(idFromName("Formulários de cadastro")).toBe(
      "formularios-de-cadastro",
    );
  });

  it("stays within 64 characters without a trailing dash", () => {
    const id = idFromName(`${"a".repeat(63)} b`);

    expect(id).toBe("a".repeat(63));
    expect(isValidInstructionId(id)).toBe(true);
  });

  it("is empty when nothing usable is left", () => {
    expect(idFromName("!!!")).toBe("");
  });
});

describe("isValidInstructionId", () => {
  it("accepts ids the API accepts and rejects the rest", () => {
    expect(isValidInstructionId("landing-pages")).toBe(true);
    expect(isValidInstructionId("-forms")).toBe(false);
    expect(isValidInstructionId("Forms")).toBe(false);
    expect(isValidInstructionId("a/b")).toBe(false);
  });
});
