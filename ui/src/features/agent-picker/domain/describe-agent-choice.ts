import type { IconType } from "react-icons";
import { AgentSpecialtyEnum } from "~types/enum/agent.enum";
import type {
  AgentChoice,
  AgentPickerGroup,
} from "./build-agent-picker-options";

export type AgentChoiceSummary = { label: string; icon: IconType };

/** Picker trigger text: "Frontend" or "Frontend · Forms". */
export function describeAgentChoice(
  groups: AgentPickerGroup[],
  choice: AgentChoice,
): AgentChoiceSummary | undefined {
  const group = groups.find((item) => item.mode.focus === choice.focus);
  if (!group) return undefined;

  const specialty = group.specialties.find(
    (item) => item.specialty === choice.specialty,
  );
  if (!specialty) return { label: group.mode.label, icon: group.mode.icon };

  return {
    label: `${group.mode.label} · ${specialty.label}`,
    icon: specialty.icon,
  };
}

/** A specialty the mode doesn't offer counts as "No specialty". */
export function isSameAgentChoice(
  groups: AgentPickerGroup[],
  a: AgentChoice,
  b: AgentChoice,
): boolean {
  return (
    a.focus === b.focus &&
    normalizeSpecialty(groups, a) === normalizeSpecialty(groups, b)
  );
}

function normalizeSpecialty(
  groups: AgentPickerGroup[],
  choice: AgentChoice,
): string {
  const group = groups.find((item) => item.mode.focus === choice.focus);
  const isOffered = group?.specialties.some(
    (item) => item.specialty === choice.specialty,
  );
  return isOffered ? choice.specialty : AgentSpecialtyEnum.NONE;
}
