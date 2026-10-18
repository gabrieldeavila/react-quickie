import type { FileUIPart } from "ai";
import { useCallback, useMemo, useState } from "react";

export type PastedChatImage = FileUIPart & { id: string };

const MAX_IMAGE_COUNT = 4;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

export function useChatComposer() {
  const [input, setInput] = useState("");
  const [pastedImages, setPastedImages] = useState<PastedChatImage[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const addPastedImages = useCallback(
    async (files: File[]) => {
      setAttachmentError(null);
      const currentCount = pastedImages.length;
      const accepted: PastedChatImage[] = [];

      for (const file of files) {
        if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
          setAttachmentError("Paste a PNG, JPEG, GIF or WebP image.");
          continue;
        }
        if (file.size === 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
          setAttachmentError("Each image must be 5 MB or smaller.");
          continue;
        }
        if (currentCount + accepted.length >= MAX_IMAGE_COUNT) {
          setAttachmentError("You can paste up to 4 images per message.");
          break;
        }

        const url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            typeof reader.result === "string"
              ? resolve(reader.result)
              : reject(new Error("Couldn't read the image."));
          reader.onerror = () =>
            reject(new Error("Couldn't read the image."));
          reader.readAsDataURL(file);
        }).catch(() => null);

        if (!url) {
          setAttachmentError("Couldn't read one of the pasted images.");
          continue;
        }

        accepted.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: "file",
          mediaType: file.type,
          filename: file.name || `image-${accepted.length + 1}`,
          url,
        });
      }

      if (accepted.length > 0) {
        setPastedImages((current) => [...current, ...accepted]);
      }
    },
    [pastedImages.length],
  );

  const removePastedImage = useCallback((id: string) => {
    setPastedImages((current) => current.filter((image) => image.id !== id));
  }, []);

  const rejectAttachments = useCallback((message: string) => {
    setAttachmentError(message);
  }, []);

  const clearInput = useCallback(() => {
    setInput("");
    setPastedImages([]);
    setAttachmentError(null);
  }, []);

  const hasInput = useMemo(
    () => input.trim().length > 0 || pastedImages.length > 0,
    [input, pastedImages.length],
  );

  return useMemo(
    () => ({
      input,
      hasInput,
      setInput,
      clearInput,
      pastedImages,
      addPastedImages,
      removePastedImage,
      attachmentError,
      rejectAttachments,
      clearAttachmentError: () => setAttachmentError(null),
    }),
    [
      addPastedImages,
      rejectAttachments,
      attachmentError,
      clearInput,
      hasInput,
      input,
      pastedImages,
      removePastedImage,
    ],
  );
}
