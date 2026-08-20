import { Popover } from "@/components/primitives/popover";
import { memo, useCallback, useMemo } from "react";
import { FiMinusCircle } from "react-icons/fi";
import { CHAT_SPECIALTY_OPTIONS } from "~types/consts/chat.const";
import { AgentSpecialtyEnum } from "~types/enum/agent.enum";
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

  const specialtyOptions = useMemo(
    () => CHAT_SPECIALTY_OPTIONS[projectContext.focus] ?? [],
    [projectContext.focus],
  );

  if (!specialtyOptions || !specialtyOptions.length) return null;

  return (
    <Popover
      value={projectContext.specialty}
      onChange={handleChange}
      options={specialtyOptions}
      ariaLabel="Selecionar especialidade do agente"
      title="Especialidade"
      defaultIcon={FiMinusCircle}
    />
  );
});

export default ChatSpecialtyPopover;
