import type {
  InstructionFormErrors,
  InstructionFormValues,
} from "../domain/instruction-form";
import type { InstructionScope } from "../domain/instruction.types";

type Props = {
  values: InstructionFormValues;
  errors: InstructionFormErrors;
  isNew: boolean;
  onChange: <K extends keyof InstructionFormValues>(
    key: K,
    value: InstructionFormValues[K],
  ) => void;
};

function FieldError({ message }: { message?: string }) {
  return message ? <span className="chat-modal__error">{message}</span> : null;
}

/** Name, id, description, starters, body and scope of one instruction. */
export function InstructionForm({ values, errors, isNew, onChange }: Props) {
  return (
    <div className="chat-modal__fields instruction-form">
      <label className="chat-control chat-control--full">
        <span className="chat-control__label">Name</span>
        <input
          className="chat-input chat-input--modal instruction-form__input"
          value={values.name}
          onChange={(event) => onChange("name", event.target.value)}
          placeholder="e.g. API conventions"
          autoFocus
        />
        <FieldError message={errors.name} />
      </label>

      <label className="chat-control chat-control--full">
        <span className="chat-control__label">Id (file name and /command)</span>
        <input
          className="chat-input chat-input--modal instruction-form__input"
          value={values.id}
          onChange={(event) => onChange("id", event.target.value)}
          readOnly={!isNew}
          placeholder="api-conventions"
        />
        <FieldError message={errors.id} />
      </label>

      <label className="chat-control chat-control--full">
        <span className="chat-control__label">Description</span>
        <input
          className="chat-input chat-input--modal instruction-form__input"
          value={values.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="One line: when to use it"
        />
      </label>

      <label className="chat-control chat-control--full">
        <span className="chat-control__label">
          Starter prompts (one per line)
        </span>
        <textarea
          className="chat-input chat-input--modal instruction-form__textarea instruction-form__textarea--short"
          value={values.startersText}
          onChange={(event) => onChange("startersText", event.target.value)}
          placeholder="Add an endpoint for…"
        />
        <FieldError message={errors.starters} />
      </label>

      <label className="chat-control chat-control--full">
        <span className="chat-control__label">Instruction (Markdown)</span>
        <textarea
          className="chat-input chat-input--modal instruction-form__textarea"
          value={values.content}
          onChange={(event) => onChange("content", event.target.value)}
          placeholder="Guidance the agent follows when this instruction is selected."
        />
        <FieldError message={errors.content} />
      </label>

      <label className="chat-control chat-control--full">
        <span className="chat-control__label">Save to</span>
        <select
          className="chat-input chat-input--modal chat-select--modal"
          value={values.scope}
          onChange={(event) =>
            onChange("scope", event.target.value as InstructionScope)
          }
        >
          <option value="global">Global (every project)</option>
          <option value="project">Project (.doty/instructions)</option>
        </select>
      </label>
    </div>
  );
}
