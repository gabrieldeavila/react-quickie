export type BuiltInCommandId = "mcp" | "instructions" | "new" | "settings";

export type SlashCommand =
  | {
      kind: "built-in";
      /** Unique within the menu (also the DOM option id suffix). */
      key: string;
      /** What the user types after the slash. */
      name: BuiltInCommandId;
      description: string;
    }
  | {
      kind: "instruction";
      key: string;
      name: string;
      description: string;
      /** The instruction is selected in this conversation (the command toggles it). */
      isActive: boolean;
    };
