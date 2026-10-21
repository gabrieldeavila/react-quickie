import type { PendingSignIn } from "../domain/sign-in-progress";

type Props = {
  pending: PendingSignIn;
  onReopen: () => void;
  onCancel: () => void;
};

/** Shown while the user finishes an OAuth sign-in in the browser. */
export function McpSignInNotice({ pending, onReopen, onCancel }: Props) {
  return (
    <div className="mcp-trust-notice" role="status">
      <p>
        Finish signing in to <strong>{pending.serverName}</strong> in your
        browser. This list updates when you're done.
      </p>
      <div className="mcp-trust-notice__actions">
        <button type="button" className="chat-button" onClick={onReopen}>
          Open sign-in page
        </button>
        <button
          type="button"
          className="chat-button chat-button--ghost"
          onClick={onCancel}
        >
          Stop waiting
        </button>
      </div>
    </div>
  );
}
