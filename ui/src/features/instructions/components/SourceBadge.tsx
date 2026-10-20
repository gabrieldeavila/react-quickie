import type { InstructionSource } from "../domain/instruction.types";

/** Where an instruction comes from: built-in, global or project. */
export function SourceBadge({ source }: { source: InstructionSource }) {
  return (
    <span className={`instruction-badge instruction-badge--${source}`}>
      {source}
    </span>
  );
}
