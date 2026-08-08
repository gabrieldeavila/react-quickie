import type { AgentFocusEnum, AgentSpecialtyEnum } from "../enum/agent.enum";

export type FocusPopoverProps = {
  value: AgentFocusEnum;
  onChange: (value: AgentFocusEnum) => void;
};

export type SpecialtyPopoverProps = {
  value: AgentSpecialtyEnum;
  onChange: (value: AgentSpecialtyEnum) => void;
  focus: AgentFocusEnum;
};
