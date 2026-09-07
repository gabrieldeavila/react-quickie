export { createProjectTools } from './project.tools';
export { createStorageTools } from './storage.tools';

export type ToolUiMetadata = {
  uiLabel: string;
  uiDescription: string;
};

export const TOOL_UI_MAPPING: Record<string, ToolUiMetadata> = {
  list_folders: {
    uiLabel: 'Listando arquivos e pastas...',
    uiDescription:
      'O sistema está examinando a estrutura de diretórios solicitada.',
  },
  create_file: {
    uiLabel: 'Criando arquivo...',
    uiDescription: 'O sistema está gerando um novo arquivo no projeto.',
  },
  edit_file: {
    uiLabel: 'Editando arquivo...',
    uiDescription:
      'O sistema está substituindo um trecho específico do arquivo.',
  },
  overwrite_file: {
    uiLabel: 'Sobrescrevendo arquivo...',
    uiDescription: 'O sistema está substituindo todo o conteúdo do arquivo.',
  },
  delete_file: {
    uiLabel: 'Removendo arquivo...',
    uiDescription: 'O sistema está apagando um arquivo existente.',
  },
  rename_file_or_folder: {
    uiLabel: 'Renomeando item...',
    uiDescription:
      'O sistema está alterando o nome de um arquivo ou diretório.',
  },
  move_file_or_folder: {
    uiLabel: 'Movendo item...',
    uiDescription:
      'O sistema está movendo um arquivo ou diretório para outro local.',
  },
  read_file: {
    uiLabel: 'Lendo conteúdo do arquivo...',
    uiDescription:
      'O sistema está abrindo o arquivo para analisar seu conteúdo.',
  },
  get_lint_errors: {
    uiLabel: 'Verificando erros de lint...',
    uiDescription:
      'O sistema está analisando possíveis problemas de qualidade no código.',
  },
  regex_search_files_content: {
    uiLabel: 'Buscando padrões no projeto...',
    uiDescription:
      'O sistema está procurando ocorrências do padrão informado em vários arquivos.',
  },
  search_content_in_file: {
    uiLabel: 'Buscando dentro do arquivo...',
    uiDescription:
      'O sistema está localizando trechos específicos dentro de um arquivo.',
  },
  created_projects: {
    uiLabel: 'Listando projetos...',
    uiDescription:
      'O sistema está identificando os projetos criados no diretório principal.',
  },
  check_typescript: {
    uiLabel: 'Validando TypeScript...',
    uiDescription: 'O sistema está verificando erros de tipagem no projeto.',
  },
  install_depency: {
    uiLabel: 'Instalando dependência...',
    uiDescription:
      'O sistema está adicionando uma nova dependência ao projeto.',
  },
  get_recent_commits: {
    uiLabel: 'Lendo commits recentes...',
    uiDescription: 'O sistema está consultando o histórico recente do Git.',
  },
  create_commit: {
    uiLabel: 'Criando commit...',
    uiDescription: 'O sistema está preparando e registrando um novo commit.',
  },
  search_commits: {
    uiLabel: 'Buscando commits...',
    uiDescription:
      'O sistema está filtrando commits por autor, data ou quantidade.',
  },
  get_uncommitted_changes: {
    uiLabel: 'Analisando alterações pendentes...',
    uiDescription:
      'O sistema está verificando arquivos modificados e diferenças no código.',
  },
  review_commit: {
    uiLabel: 'Revisando commit...',
    uiDescription:
      'O sistema está inspecionando os arquivos e o diff de um commit específico.',
  },
};

export function enrichToolPart(part: Record<string, unknown>) {
  const rawType = part?.type;
  const type = typeof rawType === 'string' ? rawType : '';
  if (!type.startsWith('tool-')) return part;

  const toolName = type.replace(/^tool-/, '');
  const metadata = TOOL_UI_MAPPING[toolName];
  const output = (part as { output?: unknown }).output;

  return {
    ...part,
    uiLabel: metadata?.uiLabel ?? 'Executando ferramenta...',
    uiDescription:
      metadata?.uiDescription ??
      'A ferramenta está sendo executada pelo sistema.',
    uiStatus: output ? 'success' : 'loading',
  };
}
