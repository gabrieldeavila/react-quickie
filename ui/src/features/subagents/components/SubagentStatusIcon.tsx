import { FiCheck, FiClock, FiLoader, FiSlash, FiX } from "react-icons/fi";
import type { SubagentViewStatus } from "../domain/subagent-view";

export function SubagentStatusIcon({ status }: { status: SubagentViewStatus }) {
  if (status === "completed") return <FiCheck aria-hidden="true" />;
  if (status === "failed") return <FiX aria-hidden="true" />;
  if (status === "denied" || status === "aborted") {
    return <FiSlash aria-hidden="true" />;
  }
  if (status === "queued") return <FiClock aria-hidden="true" />;
  return <FiLoader className="subagent-status__spinner" aria-hidden="true" />;
}
