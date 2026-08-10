import { Popover } from "@/components/primitives/popover";
import { CHAT_SPECIALTY_OPTIONS } from "@/types/consts/chat.const";
import { AgentFocusEnum, AgentSpecialtyEnum } from "@/types/enum/agent.enum";
import { memo, useCallback } from "react";
import { FiMinusCircle } from "react-icons/fi";
import { useChatBaseContext } from "../../context/context";

const ChatSpecialtyPopover = memo(() => {
  const { projectContext, setProjectContext } = useChatBaseContext();

  const handleChange = useCallback(
    (value: AgentSpecialtyEnum) => {
      setProjectContext((current) => ({
        ...current,
        specialty: value,
      }));
    },
    [setProjectContext],
  );

  if (projectContext.focus !== AgentFocusEnum.FRONTEND) return null;

  return (
    <Popover
      value={projectContext.specialty}
      onChange={handleChange}
      options={CHAT_SPECIALTY_OPTIONS}
      ariaLabel="Selecionar especialidade do agente"
      title="Especialidade"
      defaultIcon={FiMinusCircle}
    />
  );
});

export default ChatSpecialtyPopover;
