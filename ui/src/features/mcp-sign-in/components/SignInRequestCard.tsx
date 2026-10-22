import { describeSignInRequest } from "../domain/describe-sign-in-request";
import type { SignInRequest } from "../domain/sign-in-request.types";

type Props = {
  request: SignInRequest;
  openedUrl?: string;
  onAccept: () => void;
  onReopen: (url: string) => void;
  onDismiss: () => void;
};

/** One server asking the user to sign in. */
export function SignInRequestCard({
  request,
  openedUrl,
  onAccept,
  onReopen,
  onDismiss,
}: Props) {
  const text = describeSignInRequest(request);
  const titleId = `sign-in-${request.id}`;

  return (
    <section className="sign-in-popup__card" aria-labelledby={titleId}>
      <strong id={titleId}>{text.title}</strong>
      <p>
        {openedUrl
          ? "Finish signing in in your browser. This closes when the server connects."
          : text.detail}
      </p>
      <div className="sign-in-popup__actions">
        {openedUrl ? (
          <button
            type="button"
            className="chat-button"
            onClick={() => onReopen(openedUrl)}
          >
            Open sign-in page
          </button>
        ) : (
          <button type="button" className="chat-button" onClick={onAccept}>
            Sign in
          </button>
        )}
        <button
          type="button"
          className="chat-button chat-button--ghost"
          onClick={onDismiss}
        >
          {openedUrl ? "Hide" : "Dismiss"}
        </button>
      </div>
    </section>
  );
}
