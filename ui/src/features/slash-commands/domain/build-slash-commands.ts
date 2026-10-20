import type { SlashCommand } from "./slash-command.types";

const BUILT_IN_COMMANDS: SlashCommand[] = [
  {
    kind: "built-in",
    key: "built-in:mcp",
    name: "mcp",
    description: "MCP servers",
  },
  {
    kind: "built-in",
    key: "built-in:instructions",
    name: "instructions",
    description: "Manage instructions",
  },
  {
    kind: "built-in",
    key: "built-in:new",
    name: "new",
    description: "New conversation",
  },
  {
    kind: "built-in",
    key: "built-in:settings",
    name: "settings",
    description: "Settings",
  },
];

type InstructionEntry = { id: string; name: string };

/** Built-in commands, then one toggle per instruction (`/<instruction-id>`). */
export function buildSlashCommands(
  instructions: InstructionEntry[],
  selectedIds: string[],
): SlashCommand[] {
  return [
    ...BUILT_IN_COMMANDS,
    ...instructions.map(
      ({ id, name }): SlashCommand => ({
        kind: "instruction",
        key: `instruction:${id}`,
        name: id,
        description: name,
        isActive: selectedIds.includes(id),
      }),
    ),
  ];
}
