import { type UIMessage } from "@ai-sdk/react";
import { AgentFocusEnum, AgentSpecialtyEnum } from "../types/enum/agent.enum";
import {
  ACTIVE_CHAT_STORAGE_KEY,
  DEFAULT_PROJECT_CONTEXT,
  PROJECT_CONTEXT_STORAGE_KEY,
  SIDEBAR_OPEN_STORAGE_KEY,
} from "../types/consts/chat.const";
import type { ProjectContext } from "@/types/interface/chat.interface";

export function isAgentFocus(value: unknown): value is AgentFocusEnum {
  return (
    value === AgentFocusEnum.FRONTEND ||
    value === AgentFocusEnum.BACKEND ||
    value === AgentFocusEnum.AGNOSTIC
  );
}

export function isAgentSpecialty(value: unknown): value is AgentSpecialtyEnum {
  return (
    value === AgentSpecialtyEnum.NONE ||
    value === AgentSpecialtyEnum.LANDING_PAGES ||
    value === AgentSpecialtyEnum.FORMS ||
    value === AgentSpecialtyEnum.REFACTOR
  );
}

export function normalizeStoredFocus(value: unknown): AgentFocusEnum {
  if (typeof value === "number") {
    return (
      [
        AgentFocusEnum.FRONTEND,
        AgentFocusEnum.BACKEND,
        AgentFocusEnum.AGNOSTIC,
      ][value] ?? DEFAULT_PROJECT_CONTEXT.focus
    );
  }
  return isAgentFocus(value) ? value : DEFAULT_PROJECT_CONTEXT.focus;
}

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

export function readProjectContext(): ProjectContext {
  if (typeof window === "undefined") return DEFAULT_PROJECT_CONTEXT;

  try {
    const raw: string | null = window.localStorage.getItem(
      PROJECT_CONTEXT_STORAGE_KEY,
    );
    if (!raw) return DEFAULT_PROJECT_CONTEXT;

    const parsed: Partial<ProjectContext & { focus: unknown }> =
      JSON.parse(raw);
    return {
      reference:
        typeof parsed.reference === "string" && parsed.reference.trim()
          ? parsed.reference
          : DEFAULT_PROJECT_CONTEXT.reference,
      focus: normalizeStoredFocus(parsed.focus),
      specialty: isAgentSpecialty(parsed.specialty)
        ? parsed.specialty
        : DEFAULT_PROJECT_CONTEXT.specialty,
      planningModeEnabled:
        typeof parsed.planningModeEnabled === "boolean"
          ? parsed.planningModeEnabled
          : DEFAULT_PROJECT_CONTEXT.planningModeEnabled,
    };
  } catch {
    return DEFAULT_PROJECT_CONTEXT;
  }
}

export function readActiveConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY);
}

export function readSidebarOpenState(): boolean {
  if (typeof window === "undefined") return true;
  const storedValue: string | null = window.localStorage.getItem(
    SIDEBAR_OPEN_STORAGE_KEY,
  );
  return storedValue === null ? true : storedValue === "true";
}

export function serializeProjectContext(context: ProjectContext): string {
  return JSON.stringify({
    reference: context.reference,
    focus: context.focus,
    specialty: context.specialty,
    planningModeEnabled: context.planningModeEnabled,
  });
}
