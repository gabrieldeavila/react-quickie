import { Popover } from "@/components/primitives/popover";
import { CHAT_MODE_OPTIONS } from "~types/consts/chat.const";
import { memo, useCallback } from "react";
import { FiCode } from "react-icons/fi";
import { useChatBaseContext } from "../../context/context";
import type { CombinedAgentEnum } from "~types/enum/agent.enum";
import {
  filterModeOptions,
  getHostFeatures,
} from "@/host/domain/host-features";
import { getRuntimeConfig } from "@/host/runtime-config";

const MODE_OPTIONS = filterModeOptions(
  CHAT_MODE_OPTIONS,
  getHostFeatures(getRuntimeConfig().host),
);

const ChatModePopover = memo(() => {
  const { projectContext, setProjectContext } = useChatBaseContext();

  const handleChange = useCallback(
    (value: CombinedAgentEnum) => {
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
      options={MODE_OPTIONS}
      ariaLabel="Select agent focus"
      title="Mode"
      defaultIcon={FiCode}
    />
  );
});

export default ChatModePopover;
