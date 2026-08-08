import type { AgentFocusEnum, AgentSpecialtyEnum } from "../enum/agent.enum";

export interface ChatHeaderProps {
  title: string;
  status?: string;
  focus: AgentFocusEnum;
  specialty: AgentSpecialtyEnum;
  onFocusChange: (value: AgentFocusEnum) => void;
  onSpecialtyChange: (value: AgentSpecialtyEnum) => void;
  onOpenProjectRoot: () => void;
  onOpenCreateProject: () => void;
  onCreateConversation: () => void;
}
