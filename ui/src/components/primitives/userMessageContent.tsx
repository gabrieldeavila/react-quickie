import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UserMessageContentProps } from "~types/interface/chat.interface";

const USER_MESSAGE_COLLAPSED_MAX_HEIGHT = 5 * 1.72 * 0.98 * 16;
const USER_MESSAGE_LINE_HEIGHT = 1.6;
const USER_MESSAGE_COLLAPSED_LINES = 5;
const USER_MESSAGE_COLLAPSED_LINE_CLAMP = String(USER_MESSAGE_COLLAPSED_LINES);

export const UserMessageContent = memo(function UserMessageContent({
  text,
  images = [],
}: UserMessageContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLDivElement | null>(null);

  const userTextStyle = useMemo(
    () =>
      ({
        lineHeight: USER_MESSAGE_LINE_HEIGHT,
        maxHeight: isExpanded
          ? "none"
          : `${USER_MESSAGE_COLLAPSED_LINES * USER_MESSAGE_LINE_HEIGHT}em`,
        WebkitLineClamp: isExpanded
          ? "unset"
          : USER_MESSAGE_COLLAPSED_LINE_CLAMP,
      }) as React.CSSProperties,
    [isExpanded],
  );

  useEffect(() => {
    const element = textRef.current;
    if (!element || !text) {
      setIsTruncated(false);
      return;
    }

    const nextIsTruncated =
      element.scrollHeight > USER_MESSAGE_COLLAPSED_MAX_HEIGHT + 1;
    setIsTruncated((current) =>
      current === nextIsTruncated ? current : nextIsTruncated,
    );
  }, [text, isExpanded]);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((value) => !value);
  }, []);

  return (
    <div className="user-message-body">
      {text ? (
        <>
          <div
            ref={textRef}
            className={`message-user-text${!isExpanded && isTruncated ? " message-user-text--clamped" : ""}`}
            style={userTextStyle}
            aria-expanded={isExpanded}
          >
            {text}
          </div>
          {isTruncated ? (
            <button
              type="button"
              className="message-expand-toggle"
              onClick={handleToggleExpanded}
              aria-label={
                isExpanded ? "Recolher mensagem" : "Expandir mensagem"
              }
            >
              {isExpanded ? "Mostrar menos" : "Mostrar mais"}
            </button>
          ) : null}
        </>
      ) : null}
      {images.length > 0 ? (
        <div className="user-message-images">
          {images.map((image, index) => (
            <img
              key={`${image.filename ?? "imagem"}-${index}`}
              src={image.url}
              alt={image.filename ?? `Imagem enviada ${index + 1}`}
              loading="lazy"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
});
