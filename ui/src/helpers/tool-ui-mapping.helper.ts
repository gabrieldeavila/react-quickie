export type ToolUiMeta = {
  label: string;
  description: string;
};

const TOOL_UI_MAPPING: Record<string, ToolUiMeta> = {
  "tool-list_folders": {
    label: "Listando arquivos e pastas...",
    description:
      "O sistema está verificando a estrutura de diretórios do projeto.",
  },
  "tool-read_file": {
    label: "Lendo conteúdo do arquivo...",
    description:
      "O sistema está abrindo o arquivo solicitado para analisar seu conteúdo.",
  },
  "tool-search_web": {
    label: "Buscando informações na web...",
    description:
      "O sistema está consultando fontes externas para encontrar informações relevantes.",
  },
  "tool-get_lint_errors": {
    label: "Verificando erros de lint...",
    description:
      "O sistema está analisando o código para identificar problemas de estilo e qualidade.",
  },
  "tool-check_typescript": {
    label: "Validando TypeScript...",
    description: "O sistema está checando tipos e consistência do código.",
  },
};

export function getToolUiMeta(toolType: string): ToolUiMeta {
  return (
    TOOL_UI_MAPPING[toolType] ?? {
      label: "Executando ferramenta...",
      description: "O sistema está processando uma operação solicitada.",
    }
  );
}

export function isToolPartType(partType: string | undefined): boolean {
  return typeof partType === "string" && partType.startsWith("tool-");
}
