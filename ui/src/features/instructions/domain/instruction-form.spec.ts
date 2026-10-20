import { describe, expect, it } from "vitest";
import {
  emptyInstructionForm,
  formForDuplicate,
  formForEdit,
  formToInput,
  hasFormErrors,
  MAX_CONTENT_BYTES,
  validateInstructionForm,
} from "./instruction-form";
import type { InstructionDetail } from "./instruction.types";

const forms: InstructionDetail = {
  id: "forms",
  name: "Forms",
  description: "Typed forms.",
  starters: ["Build a signup form", "Add validation"],
  content: "Use Zod.",
  source: "built-in",
  editable: false,
};

const valid = {
  ...emptyInstructionForm(),
  name: "Forms",
  id: "forms",
  content: "Use Zod.",
};

describe("formForEdit", () => {
  it("edits a built-in as a global copy with the same id", () => {
    expect(formForEdit(forms)).toEqual({
      name: "Forms",
      id: "forms",
      description: "Typed forms.",
      startersText: "Build a signup form\nAdd validation",
      content: "Use Zod.",
      scope: "global",
    });
  });

  it("keeps the scope of a global or project instruction", () => {
    expect(formForEdit({ ...forms, source: "project" }).scope).toBe("project");
  });
});

describe("formForDuplicate", () => {
  it("renames the copy and gives it a new id", () => {
    expect(formForDuplicate(forms)).toMatchObject({
      name: "Forms (copy)",
      id: "forms-copy",
      content: "Use Zod.",
    });
  });
});

describe("validateInstructionForm", () => {
  it("accepts a complete form", () => {
    expect(hasFormErrors(validateInstructionForm(valid))).toBe(false);
  });

  it("reports each missing or invalid field", () => {
    const errors = validateInstructionForm(emptyInstructionForm());

    expect(Object.keys(errors).sort()).toEqual(["content", "id", "name"]);
  });

  it("rejects bad ids, too many starters and oversized content", () => {
    expect(validateInstructionForm({ ...valid, id: "Bad Id" }).id).toBeTruthy();
    expect(
      validateInstructionForm({
        ...valid,
        startersText: Array(11).fill("s").join("\n"),
      }).starters,
    ).toBeTruthy();
    expect(
      validateInstructionForm({
        ...valid,
        content: "x".repeat(MAX_CONTENT_BYTES + 1),
      }).content,
    ).toMatch(/20 KB/);
  });
});

describe("formToInput", () => {
  it("trims the fields and splits starters by line, skipping blanks", () => {
    expect(
      formToInput({
        ...valid,
        name: " Forms ",
        description: " Typed. ",
        startersText: " One \n\n Two ",
        content: " Use Zod. ",
      }),
    ).toEqual({
      name: "Forms",
      description: "Typed.",
      starters: ["One", "Two"],
      content: "Use Zod.",
    });
  });
});
