import { FaMagic } from "react-icons/fa";
import type { PopoverOption } from "~types/interface/primitive-popover.interface";

export enum AgentFocusPluginEnum {
  AGENT_BUILDER = "agent_builder",
}

export const CHAT_PLUGIN_MODE_OPTIONS: PopoverOption<AgentFocusPluginEnum>[] = [
  {
    value: AgentFocusPluginEnum.AGENT_BUILDER,
    label: "Agent Builder",
    icon: FaMagic,
  },
];

export const CHAT_PLUGIN_SPECIALTY_OPTIONS: Partial<
  Record<AgentFocusPluginEnum, PopoverOption<string>[]>
> = {};
