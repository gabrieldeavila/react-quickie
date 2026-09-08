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
  "tool-create_file": {
    label: "Criando arquivo...",
    description: "O sistema está criando um novo arquivo no projeto.",
  },
  "tool-edit_file": {
    label: "Editando arquivo...",
    description:
      "O sistema está substituindo um bloco específico de conteúdo em um arquivo existente.",
  },
  "tool-overwrite_file": {
    label: "Sobrescrevendo arquivo...",
    description:
      "O sistema está substituindo todo o conteúdo de um arquivo existente.",
  },
  "tool-delete_file": {
    label: "Deletando arquivo...",
    description: "O sistema está removendo um arquivo do projeto.",
  },
  "tool-rename_file_or_folder": {
    label: "Renomeando item...",
    description:
      "O sistema está alterando o nome de um arquivo ou diretório existente.",
  },
  "tool-move_file_or_folder": {
    label: "Movendo item...",
    description:
      "O sistema está deslocando um arquivo ou diretório para outro caminho.",
  },
  "tool-read_file": {
    label: "Lendo conteúdo do arquivo...",
    description:
      "O sistema está abrindo o arquivo solicitado para analisar seu conteúdo.",
  },
  "tool-get_lint_errors": {
    label: "Verificando erros de lint...",
    description:
      "O sistema está analisando o código para identificar problemas de estilo e qualidade.",
  },
  "tool-regex_search_files_content": {
    label: "Buscando padrão em arquivos...",
    description:
      "O sistema está procurando ocorrências de um padrão regex em múltiplos arquivos.",
  },
  "tool-search_content_in_file": {
    label: "Buscando conteúdo no arquivo...",
    description:
      "O sistema está procurando um padrão regex dentro de um arquivo específico.",
  },
  "tool-search_web": {
    label: "Buscando informações na web...",
    description:
      "O sistema está consultando fontes externas para encontrar informações relevantes.",
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
