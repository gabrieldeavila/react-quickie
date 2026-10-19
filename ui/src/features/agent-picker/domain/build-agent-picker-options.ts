import type { IconType } from "react-icons";
import {
  AgentSpecialtyEnum,
  type CombinedAgentEnum,
} from "~types/enum/agent.enum";
import type { PopoverOption } from "~types/interface/primitive-popover.interface";
import {
  filterModeOptions,
  type HostFeatures,
} from "@/host/domain/host-features";

/** What the agent picker sets: the mode (focus) and its specialty. */
export type AgentChoice = { focus: CombinedAgentEnum; specialty: string };

export type AgentPickerOption = AgentChoice & {
  key: string;
  label: string;
  icon: IconType;
};

/** One mode row, followed by that mode's specialties (without "No specialty"). */
export type AgentPickerGroup = {
  mode: AgentPickerOption;
  specialties: AgentPickerOption[];
};

type BuildAgentPickerOptionsInput = {
  modes: PopoverOption<CombinedAgentEnum>[];
  specialties: Partial<Record<CombinedAgentEnum, PopoverOption<string>[]>>;
  features: HostFeatures;
};

export function buildAgentPickerOptions({
  modes,
  specialties,
  features,
}: BuildAgentPickerOptionsInput): AgentPickerGroup[] {
  return filterModeOptions(modes, features).map((mode) =>
    toGroup(mode, specialties[mode.value] ?? []),
  );
}

function toGroup(
  mode: PopoverOption<CombinedAgentEnum>,
  specialties: PopoverOption<string>[],
): AgentPickerGroup {
  return {
    mode: toOption(mode.value, AgentSpecialtyEnum.NONE, mode),
    specialties: specialties
      .filter((specialty) => specialty.value !== AgentSpecialtyEnum.NONE)
      .map((specialty) => toOption(mode.value, specialty.value, specialty)),
  };
}

function toOption(
  focus: CombinedAgentEnum,
  specialty: string,
  { label, icon }: PopoverOption<unknown>,
): AgentPickerOption {
  return { key: `${focus}:${specialty}`, focus, specialty, label, icon };
}
