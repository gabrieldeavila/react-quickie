import { FaPalette } from "react-icons/fa";
import { FaGitAlt } from "react-icons/fa6";
import { AgentFocusEnum, AgentSpecialtyEnum } from "../enum/agent.enum";
import type { ProjectContext } from "../interface/chat.interface";
import type { PopoverOption } from "../interface/primitive-popover.interface";
import { AiFillApi } from "react-icons/ai";
import {
  FiLayout,
  FiMinusCircle,
  FiPackage,
  FiShuffle,
  FiTool,
} from "react-icons/fi";

export const PROJECT_CONTEXT_STORAGE_KEY: string = "project-context";
export const ACTIVE_CHAT_STORAGE_KEY: string = "active-chat-conversation-id";
export const SIDEBAR_OPEN_STORAGE_KEY: string = "chat-sidebar-open";

export const DEFAULT_PROJECT_CONTEXT: ProjectContext = {
  reference: "/src",
  focus: AgentFocusEnum.AGNOSTIC,
  specialty: AgentSpecialtyEnum.NONE,
  planningModeEnabled: false,
};

export const CHAT_MODE_OPTIONS: PopoverOption<AgentFocusEnum>[] = [
  { value: AgentFocusEnum.FRONTEND, label: "Frontend", icon: FaPalette },
  { value: AgentFocusEnum.BACKEND, label: "Backend", icon: AiFillApi },
  { value: AgentFocusEnum.AGNOSTIC, label: "Agnóstico", icon: FiShuffle },
  { value: AgentFocusEnum.GIT, label: "Git", icon: FaGitAlt },
];

export const CHAT_SPECIALTY_OPTIONS: PopoverOption<AgentSpecialtyEnum>[] = [
  {
    value: AgentSpecialtyEnum.NONE,
    label: "Sem especialidade",
    icon: FiMinusCircle,
  },
  {
    value: AgentSpecialtyEnum.LANDING_PAGES,
    label: "Landing Pages",
    icon: FiLayout,
  },
  { value: AgentSpecialtyEnum.FORMS, label: "Forms", icon: FiPackage },
  { value: AgentSpecialtyEnum.REFACTOR, label: "Refatoração", icon: FiTool },
];
