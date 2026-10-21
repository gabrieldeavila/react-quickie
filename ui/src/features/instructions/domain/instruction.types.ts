/** Where an instruction comes from (mirrors the API). */
export type InstructionSource = "built-in" | "global" | "project";

/** The scopes the user can save to; built-ins are read-only. */
export type InstructionScope = Exclude<InstructionSource, "built-in">;

/** `GET /instructions` entry. */
export type InstructionSummary = {
  id: string;
  name: string;
  description: string;
  starters: string[];
  source: InstructionSource;
  /** False for built-ins: "editing" one saves a copy with the same id. */
  editable: boolean;
};

/** `GET /instructions/:id`: the summary plus the Markdown body. */
export type InstructionDetail = InstructionSummary & { content: string };

/** What `PUT /instructions/:scope/:id` takes. */
export type InstructionInput = {
  name: string;
  description: string;
  starters: string[];
  content: string;
};
