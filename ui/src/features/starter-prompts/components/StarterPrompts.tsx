import type { StarterPrompt } from "../domain/starter-prompts";

type StarterPromptsProps = {
  prompts: StarterPrompt[];
  onPick: (text: string) => void;
};

/** Suggestion chips; picking one fills the message box (it doesn't send). */
export function StarterPrompts({ prompts, onPick }: StarterPromptsProps) {
  return (
    <ul className="starter-prompts" aria-label="Starter prompts">
      {prompts.map((prompt) => (
        <li key={prompt.label}>
          <button
            type="button"
            className="starter-prompts__item"
            title={prompt.text}
            onClick={() => onPick(prompt.text)}
          >
            {prompt.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
