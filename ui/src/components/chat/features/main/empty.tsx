import { emptyStateHeading } from "@/features/starter-prompts/domain/empty-state-heading";
import { starterPromptsFor } from "@/features/starter-prompts/domain/starter-prompts";
import { StarterPrompts } from "@/features/starter-prompts/components/StarterPrompts";
import { useChatBaseContext } from "../../context/context";
import { useFillComposer } from "../../hooks/events/useFillComposer";

export function ChatEmptyState() {
  const { projectContext, conversationModel } = useChatBaseContext();
  const fillComposer = useFillComposer();
  const imagesAllowed =
    conversationModel.resolved?.model.supportsImages ?? true;

  return (
    <div className="chat-empty">
      <h2>{emptyStateHeading(projectContext.focus)}</h2>
      <StarterPrompts
        prompts={starterPromptsFor(projectContext.focus)}
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
