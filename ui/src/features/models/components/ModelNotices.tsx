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
          ? `O modelo ${unavailableModel} não está mais disponível. Usando ${resolved.model.label}.`
          : `O modelo ${unavailableModel} não está mais disponível.`,
      );
    }
    if (resolved && !resolved.model.supportsTools) {
      notices.push(
        `${resolved.model.label} não usa ferramentas: o modo agente está indisponível.`,
      );
    }
    if (resolved && !resolved.model.supportsImages && hasPastedImages) {
      notices.push(
        `${resolved.model.label} não aceita imagens; elas não serão enviadas.`,
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
