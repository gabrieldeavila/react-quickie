import { FiX } from "react-icons/fi";
import { useChatBaseContext } from "../../../context/context";

export function PastedImages() {
  const { pastedImages, removePastedImage } = useChatBaseContext();

  if (pastedImages.length === 0) return null;

  return (
    <div className="chat-pasted-images" aria-label="Images to send">
      {pastedImages.map((image) => (
        <div className="chat-pasted-image" key={image.id}>
          <img src={image.url} alt={image.filename ?? "Pasted image"} />
          <button
            type="button"
            className="chat-pasted-image__remove"
            onClick={() => removePastedImage(image.id)}
            aria-label={`Remove ${image.filename ?? "image"}`}
            title="Remove image"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
