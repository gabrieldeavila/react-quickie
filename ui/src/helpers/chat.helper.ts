import { type UIMessage } from "@ai-sdk/react";
import {
  ACTIVE_CHAT_STORAGE_KEY,
  DEFAULT_PROJECT_CONTEXT,
  PROJECT_CONTEXT_STORAGE_KEY,
} from "../../types/consts/chat.const";
import type { ProjectContext } from "../../types/interface/chat.interface";
import { pickHostRoot } from "@/host/domain/pick-host-root";
import { getRuntimeConfig } from "@/host/runtime-config";

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

/** Stored context, with the root forced to a host workspace folder (VSCode). */
export function readProjectContext(): ProjectContext {
  const stored = readStoredProjectContext();
  return {
    ...stored,
    reference: pickHostRoot(stored.reference, getRuntimeConfig().roots),
  };
}

/** Older saved values may still carry `focus` / `specialty`; they are ignored. */
function readStoredProjectContext(): ProjectContext {
  if (typeof window === "undefined") return DEFAULT_PROJECT_CONTEXT;

  try {
    const raw: string | null = window.localStorage.getItem(
      PROJECT_CONTEXT_STORAGE_KEY,
    );
    if (!raw) return DEFAULT_PROJECT_CONTEXT;

    const parsed: Partial<ProjectContext> = JSON.parse(raw);
    return {
      reference:
        typeof parsed.reference === "string" && parsed.reference.trim()
          ? parsed.reference
          : DEFAULT_PROJECT_CONTEXT.reference,
    };
  } catch {
    return DEFAULT_PROJECT_CONTEXT;
  }
}

export function readActiveConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY);
}

export function serializeProjectContext(context: ProjectContext): string {
  return JSON.stringify({ reference: context.reference });
}
