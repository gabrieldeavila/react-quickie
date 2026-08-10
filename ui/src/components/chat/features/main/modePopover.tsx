import { Popover } from "@/components/primitives/popover";
import { CHAT_MODE_OPTIONS } from "@/types/consts/chat.const";
import { memo, useCallback } from "react";
import { FiCode } from "react-icons/fi";
import { useChatBaseContext } from "../../context/context";
import type { AgentFocusEnum } from "@/types/enum/agent.enum";

const ChatModePopover = memo(() => {
  const { projectContext, setProjectContext } = useChatBaseContext();

  const handleChange = useCallback(
    (value: AgentFocusEnum) => {
      setProjectContext((current) => ({
        ...current,
        focus: value,
      }));
    },
    [setProjectContext],
  );

  return (
    <Popover
      value={projectContext.focus}
      onChange={handleChange}
      options={CHAT_MODE_OPTIONS}
      ariaLabel="Selecionar foco do agente"
      title="Modo"
      defaultIcon={FiCode}
    />
  );
});

export default ChatModePopover;
