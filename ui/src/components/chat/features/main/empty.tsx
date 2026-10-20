import { starterPromptsFor } from "@/features/starter-prompts/domain/starter-prompts";
import { StarterPrompts } from "@/features/starter-prompts/components/StarterPrompts";
import { useChatBaseContext } from "../../context/context";
import { useFillComposer } from "../../hooks/events/useFillComposer";

export function ChatEmptyState() {
  const { instructionSelection, conversationModel } = useChatBaseContext();
  const fillComposer = useFillComposer();
  const imagesAllowed =
    conversationModel.resolved?.model.supportsImages ?? true;

  return (
    <div className="chat-empty">
      <h2>What do you want to build?</h2>
      <StarterPrompts
        prompts={starterPromptsFor(instructionSelection.selected)}
        onPick={fillComposer}
      />
      {imagesAllowed ? (
        <p className="chat-empty__hint">
          Tip: paste a screenshot or mockup into the message box.
        </p>
      ) : null}
    </div>
  );
}
