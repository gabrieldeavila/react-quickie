import type {
  RequestMessage,
  RequestPart,
} from "@/features/chat/domain/build-request-messages";
import type { ModelCapabilities } from "./model-catalog.types";

export type ModelTarget = {
  providerId: string;
  capabilities: ModelCapabilities;
};

const isImagePart = (part: RequestPart): boolean =>
  part.type === "file" &&
  typeof part.mediaType === "string" &&
  part.mediaType.startsWith("image/");

const metadataProviders = (part: RequestPart): string[] => {
  const metadata = part.providerMetadata;
  return metadata && typeof metadata === "object" ? Object.keys(metadata) : [];
};

/**
 * Reasoning carries provider-specific signatures/item ids, so it only goes
 * back to the provider that wrote it. Reasoning without metadata is plain
 * text and providers that can't use it skip it.
 */
function isReasoningAllowed(part: RequestPart, target: ModelTarget): boolean {
  if (!target.capabilities.supportsReasoning) return false;
  const owners = metadataProviders(part);
  return owners.length === 0 || owners.includes(target.providerId);
}

function isPartAllowed(part: RequestPart, target: ModelTarget): boolean {
  if (part.type === "reasoning") return isReasoningAllowed(part, target);
  if (isImagePart(part)) return target.capabilities.supportsImages;
  return true;
}

/**
 * Request messages → what the target model can take. Runs on every request,
 * so switching models mid-conversation drops what the new model can't read.
 * Messages left empty are dropped (the API rejects them).
 */
export function filterPartsByCapabilities(
  messages: RequestMessage[],
  target: ModelTarget,
): RequestMessage[] {
  return messages.flatMap((message) => {
    const parts = message.parts.filter((part) => isPartAllowed(part, target));
    return parts.length > 0 ? [{ ...message, parts }] : [];
  });
}
