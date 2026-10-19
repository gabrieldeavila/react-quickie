import { useCallback, useMemo } from "react";
import {
  CHAT_MODE_OPTIONS,
  CHAT_SPECIALTY_OPTIONS,
} from "~types/consts/chat.const";
import { getHostFeatures } from "@/host/domain/host-features";
import { getRuntimeConfig } from "@/host/runtime-config";
import {
  buildAgentPickerOptions,
  type AgentChoice,
} from "@/features/agent-picker/domain/build-agent-picker-options";
import { useChatBaseContext } from "../../context/context";

const AGENT_PICKER_GROUPS = buildAgentPickerOptions({
  modes: CHAT_MODE_OPTIONS,
  specialties: CHAT_SPECIALTY_OPTIONS,
  features: getHostFeatures(getRuntimeConfig().host),
});

/** Binds the agent picker to the project context (mode + specialty). */
export function useAgentChoice() {
  const { projectContext, setProjectContext } = useChatBaseContext();

  const value: AgentChoice = useMemo(
    () => ({
      focus: projectContext.focus,
      specialty: projectContext.specialty,
    }),
    [projectContext.focus, projectContext.specialty],
  );

  const selectAgent = useCallback(
    ({ focus, specialty }: AgentChoice) => {
      setProjectContext((current) => ({ ...current, focus, specialty }));
    },
    [setProjectContext],
  );

  return { groups: AGENT_PICKER_GROUPS, value, selectAgent };
}
