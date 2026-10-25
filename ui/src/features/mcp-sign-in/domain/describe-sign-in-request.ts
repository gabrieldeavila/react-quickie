import type { SignInRequest } from "./sign-in-request.types";

export type SignInRequestText = { title: string; detail: string };

/**
 * The popup's wording. A printed link is a guess from the server's output,
 * so it names the site and says so.
 */
export function describeSignInRequest(
  request: SignInRequest,
): SignInRequestText {
  const { serverName, host, message } = request;
  switch (request.source) {
    case "oauth":
      return {
        title: `${serverName} needs you to sign in`,
        detail: "Opens the server's sign-in page in your browser.",
      };
    case "elicitation":
      return {
        title: `${serverName} asks you to sign in`,
        detail: [message, host ? `Opens ${host}.` : ""]
          .filter(Boolean)
          .join(" "),
      };
    case "server-output":
      return {
        title: `${serverName} printed a sign-in link`,
        detail: `Opens ${host ?? "a page"}. Continue only if you expected this server to ask for a login.`,
      };
  }
}
