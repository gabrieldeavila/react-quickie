export type ToolUiMeta = {
  label: string;
  description: string;
};

export const TOOL_UI_MAPPING: Record<string, ToolUiMeta> = {
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
  "tool-create_commit": {
    label: "Criando commit...",
    description:
      "O sistema está registrando as alterações no histórico do Git.",
  },
  "tool-get_recent_commits": {
    label: "Buscando commits recentes...",
    description:
      "O sistema está consultando os últimos commits do repositório.",
  },
  "tool-search_commits": {
    label: "Pesquisando commits...",
    description:
      "O sistema está procurando commits que correspondam ao critério informado.",
  },
  "tool-get_uncommitted_changes": {
    label: "Verificando mudanças não commitadas...",
    description:
      "O sistema está analisando os arquivos alterados no repositório.",
  },
  "tool-review_commit": {
    label: "Revisando commit...",
    description:
      "O sistema está inspecionando os detalhes do commit solicitado.",
  },
  "tool-created_projects": {
    label: "Listando projetos criados...",
    description:
      "O sistema está verificando os projetos disponíveis no diretório principal.",
  },
  "tool-check_typescript_projects": {
    label: "Validando TypeScript dos projetos...",
    description:
      "O sistema está checando a consistência de TypeScript nos projetos encontrados.",
  },
  "tool-create_component_blueprint": {
    label: "Gerando blueprint do componente...",
    description:
      "O sistema está montando a estrutura base de um novo componente React.",
  },
  "tool-install_depency": {
    label: "Instalando dependência...",
    description: "O sistema está adicionando uma nova dependência ao projeto.",
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
