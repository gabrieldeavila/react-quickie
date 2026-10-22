import { useSignInRequests } from "../hooks/useSignInRequests";
import { SignInRequestCard } from "./SignInRequestCard";

type Props = { root: string };

/** MCP servers asking the user to sign in, whatever way they asked. */
export function SignInPopup({ root }: Props) {
  const state = useSignInRequests(root);
  if (!state.requests.length) return null;

  return (
    <div className="sign-in-popup" role="region" aria-label="Sign-in requests">
      {state.requests.map((request) => (
        <SignInRequestCard
          key={request.id}
          request={request}
          openedUrl={state.openedUrl(request.id)}
          onAccept={() => void state.accept(request)}
          onReopen={state.reopen}
          onDismiss={() => void state.dismiss(request)}
        />
      ))}
      {state.error ? (
        <p className="sign-in-popup__error" role="alert">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
