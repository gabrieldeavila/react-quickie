export type AgentInput = {
  name: string;
  label: string;
  icon: string;
  iconImport: string;
};

/** Lowercase snake_case: becomes a folder name and an enum member. */
const AGENT_NAME = /^[a-z][a-z0-9_]{0,48}$/;
/** A react-icons component name, inserted into source as an identifier. */
const ICON_NAME = /^[A-Za-z][A-Za-z0-9]{0,80}$/;
/** A react-icons subpackage, e.g. `react-icons/fa`. */
const ICON_IMPORT = /^react-icons\/[a-z0-9]+$/;

export class InvalidAgentInputError extends Error {}

/**
 * `create_agent` writes files named after `name` and pastes `icon` and
 * `label` into TypeScript source, so model input is checked first: no path
 * segments, no code. The label is later inserted as a JSON string literal.
 */
export function validateAgentInput(input: AgentInput): AgentInput {
  const name = input.name.trim();
  const label = input.label.trim();
  const icon = input.icon.trim();
  const iconImport = input.iconImport.trim();

  if (!AGENT_NAME.test(name)) {
    throw new InvalidAgentInputError(
      `Nome de agente inválido: "${input.name}". Use letras minúsculas, números e "_" (ex: "data_analyst").`,
    );
  }
  if (!label || label.length > 80) {
    throw new InvalidAgentInputError(
      'O label deve ter entre 1 e 80 caracteres.',
    );
  }
  if (!ICON_NAME.test(icon)) {
    throw new InvalidAgentInputError(
      `Nome de ícone inválido: "${input.icon}".`,
    );
  }
  if (!ICON_IMPORT.test(iconImport)) {
    throw new InvalidAgentInputError(
      `Import de ícone inválido: "${input.iconImport}". Use um pacote do react-icons, como "react-icons/fa".`,
    );
  }
  return { name, label, icon, iconImport };
}
