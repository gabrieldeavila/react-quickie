import { getRuntimeConfig } from "../runtime-config";

type Props = {
  value: string;
  onChange: (root: string) => void;
};

/** VSCode multi-root picker; a single-folder workspace needs no picker. */
export function WorkspaceRootSelect({ value, onChange }: Props) {
  const { roots } = getRuntimeConfig();
  if (roots.length <= 1) return null;

  return (
    <label className="chat-control chat-control--full">
      <span className="chat-control__label">Pasta do workspace</span>
      <select
        className="chat-input chat-input--modal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {roots.map((root) => (
          <option key={root} value={root}>
            {root}
          </option>
        ))}
      </select>
    </label>
  );
}
