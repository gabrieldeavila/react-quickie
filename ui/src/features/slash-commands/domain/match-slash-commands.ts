import type { SlashCommand } from "./slash-command.types";

const KIND_ORDER: Record<SlashCommand["kind"], number> = {
  "built-in": 0,
  instruction: 1,
};

/**
 * Commands whose name matches `query`: prefix matches before substring
 * matches, built-ins before instructions, otherwise in list order.
 */
export function matchSlashCommands(
  commands: SlashCommand[],
  query: string,
): SlashCommand[] {
  const rank = (command: SlashCommand): number | null => {
    if (command.name.startsWith(query)) return 0;
    if (command.name.includes(query)) return 1;
    return null;
  };

  return commands
    .map((command, index) => ({ command, index, rank: rank(command) }))
    .filter(
      (entry): entry is typeof entry & { rank: number } => entry.rank !== null,
    )
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        KIND_ORDER[a.command.kind] - KIND_ORDER[b.command.kind] ||
        a.index - b.index,
    )
    .map(({ command }) => command);
}
