import type { ReactNode } from "react";
import { InstructionsPicker } from "@/features/instructions/components/InstructionsPicker";
import { ModelPicker } from "@/features/models/components/ModelPicker";
import { UsageBadges } from "@/features/usage/components/UsageBadges";
import {
  useChatBaseContext,
  useChatServicesContext,
} from "../../../context/context";

type ComposerToolbarProps = {
  /** The send/stop button, pinned to the right edge. */
  children: ReactNode;
};

/** Bottom row of the message box: instructions and model pickers, usage, send. */
export function ComposerToolbar({ children }: ComposerToolbarProps) {
  const {
    conversationModel,
    instructions,
    instructionSelection,
    setIsInstructionsDialogOpen,
  } = useChatBaseContext();
  const { renderedMessages } = useChatServicesContext();

  return (
    <div className="chat-composer__toolbar">
      <div className="chat-composer__pickers">
        <InstructionsPicker
          instructions={instructions.instructions}
          selected={instructionSelection.selected}
          selectedIds={instructionSelection.selectedIds}
          onToggle={instructionSelection.toggle}
          onManage={() => setIsInstructionsDialogOpen(true)}
          error={instructions.error}
        />
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
