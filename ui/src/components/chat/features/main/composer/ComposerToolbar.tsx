import type { ReactNode } from "react";
import { AgentPicker } from "@/features/agent-picker/components/AgentPicker";
import { ModelPicker } from "@/features/models/components/ModelPicker";
import { UsageBadges } from "@/features/usage/components/UsageBadges";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../../../context/context";
import { useAgentChoice } from "../../../hooks/events/useAgentChoice";

type ComposerToolbarProps = {
  /** The send/stop button, pinned to the right edge. */
  children: ReactNode;
};

/** Bottom row of the message box: agent and model pickers, usage, send. */
export function ComposerToolbar({ children }: ComposerToolbarProps) {
  const { conversationModel } = useChatBaseContext();
  const { renderedMessages } = useChatServicesContext();
  const { groups, value, selectAgent } = useAgentChoice();

  return (
    <div className="chat-composer__toolbar">
      <div className="chat-composer__pickers">
        <AgentPicker groups={groups} value={value} onChange={selectAgent} />
        <ModelPicker
          modelRef={conversationModel.modelRef}
          options={conversationModel.options}
          selectModel={conversationModel.selectModel}
        />
      </div>
      <div className="chat-composer__trailing">
        {renderedMessages.length > 0 ? (
          <UsageBadges
            messages={renderedMessages}
            contextWindow={conversationModel.resolved?.model.contextWindow}
          />
        ) : null}
        {children}
      </div>
    </div>
  );
}
