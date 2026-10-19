import { memo } from "react";
import type { ConversationModel } from "../hooks/useConversationModel";

type ModelNoticesProps = Pick<
  ConversationModel,
  "unavailableModel" | "resolved"
> & { hasPastedImages: boolean };

/** Small composer notices about the active model's availability and capabilities. */
export const ModelNotices = memo(
  ({ unavailableModel, resolved, hasPastedImages }: ModelNoticesProps) => {
    const notices: string[] = [];

    if (unavailableModel) {
      notices.push(
        resolved
          ? `The model ${unavailableModel} is no longer available. Using ${resolved.model.label}.`
          : `The model ${unavailableModel} is no longer available.`,
      );
    }
    if (resolved && !resolved.model.supportsTools) {
      notices.push(
        `${resolved.model.label} doesn't use tools, so agent mode is unavailable.`,
      );
    }
    if (resolved && !resolved.model.supportsImages && hasPastedImages) {
      notices.push(
        `${resolved.model.label} doesn't accept images, so they won't be sent.`,
      );
    }

    if (notices.length === 0) return null;

    return (
      <div className="chat-model-notices" role="status">
        {notices.map((notice) => (
          <p className="chat-attachment-error" key={notice}>
            {notice}
          </p>
        ))}
      </div>
    );
  },
);
