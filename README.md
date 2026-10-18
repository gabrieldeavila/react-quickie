# doty

**doty** é um assistente de desenvolvimento com interface de chat para trabalhar em projetos dentro de um workspace local. Ele combina um frontend React com uma API NestJS e modelos da OpenAI, Anthropic, DeepSeek ou de qualquer servidor compatível com a API da OpenAI (OpenRouter, Ollama, LM Studio). O agente pode ajudar a entender e modificar projetos, executar ferramentas de desenvolvimento e criar projetos a partir de templates.

## Funcionalidades

- Chat com streaming de respostas e contexto do projeto selecionado.
- Seletor de provedor/modelo por conversa (veja [Provedores e modelos](#provedores-e-modelos)).
- Modos especializados para tarefas de frontend e Git, além das ferramentas gerais do agente.
- Ferramentas para consultar e alterar arquivos, trabalhar com projetos e executar comandos Bash.
- Aprovação explícita para comandos Bash que exigem confirmação; comandos considerados arriscados não são executados silenciosamente.
- Criação de projetos com os templates `vite-base`, `next-base`, `nest-base` e `nest-vite-base` (NestJS + Vite).
- Execução de tarefas delegadas a subagentes e suporte a modo de planejamento.

> **Segurança:** doty foi projetado para uso local e não substitui o isolamento de um sandbox. Configure o workspace para uma pasta confiável e revise os comandos antes de aprová-los. Não exponha a API publicamente sem adicionar os controles de autenticação e segurança adequados.

## Tecnologias

- **Frontend:** React 19, TypeScript, Vite e AI SDK.
- **Backend:** NestJS 11, TypeScript e AI SDK para integração com modelos.
- **Modelos:** OpenAI, Anthropic, DeepSeek e OpenAI-compatible via AI SDK, configurados por variáveis de ambiente.
- **Persistência local:** IndexedDB no navegador para dados do chat.
- **Containers:** Docker Compose para executar a interface e a API.

## Requisitos

- Node.js 24 (a versão usada nas imagens Docker do projeto).
- npm.
- Uma chave de API de pelo menos um provedor (OpenAI, Anthropic, DeepSeek) ou a URL de um servidor compatível com a API da OpenAI.
- Docker e Docker Compose, somente para a execução containerizada.

## Configuração local

1. Instale as dependências a partir da raiz do repositório:

   ```bash
   npm install
   ```

   O script `postinstall` instala também as dependências de `api/` e `ui/`.

2. Crie `api/.env` com as configurações do modelo:

   ```dotenv
   # Ou OPENAI_API_KEY / DEEPSEEK_API_KEY; basta um provedor.
   ANTHROPIC_API_KEY=sua-chave-de-api
   DOTY_WORKSPACE_ROOTS=/caminho/absoluto/para/seus/projetos
   ```

   Veja [Provedores e modelos](#provedores-e-modelos) para as demais chaves e [Workspace e dados](#workspace-e-dados) para o que `DOTY_WORKSPACE_ROOTS` controla.

3. Confirme a URL da API usada pelo frontend. O arquivo `ui/.env.development` já define `VITE_API_URL=http://localhost:3000` para desenvolvimento local. Se a API estiver em outro endereço, ajuste esse valor antes de iniciar a interface.

4. Inicie a API e a interface em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

   A interface fica disponível normalmente em `http://localhost:5173` e a API em `http://localhost:3000`.

Para compilar os dois projetos, execute na raiz:

```bash
npm run build
```

## Execução com Docker Compose

1. Crie ou atualize o arquivo `.env` na raiz e informe a pasta do host que será disponibilizada ao backend como workspace:

   ```dotenv
   BASE_CODE_PATH=/caminho/absoluto/para/seus/projetos
   ```

2. Crie `api/.env` com a chave de pelo menos um provedor, como mostrado na configuração local.

3. Construa e inicie os serviços:

   ```bash
   docker compose up -d --build
   ```

A interface será exposta em `http://localhost:8080` e a API em `http://localhost:4000`. Os projetos criados ou acessados pelo backend ficam no diretório do host configurado em `BASE_CODE_PATH`.

Para interromper os serviços:

```bash
docker compose down
```

## Provedores e modelos

A API só oferece os provedores que têm chave configurada em `api/.env`. Cada conversa guarda seu modelo; o seletor fica no cabeçalho do chat, ao lado do modo. Uma conversa nova começa com o último modelo escolhido.

| Variável                     | Uso                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`             | OpenAI (`OPENAI_KEY`, o nome antigo, ainda é aceito).                                        |
| `ANTHROPIC_API_KEY`          | Anthropic.                                                                                   |
| `DEEPSEEK_API_KEY`           | DeepSeek.                                                                                    |
| `OPENAI_COMPATIBLE_BASE_URL` | URL de um servidor compatível com a API da OpenAI (ex.: `http://localhost:11434/v1`).         |
| `OPENAI_COMPATIBLE_API_KEY`  | Chave desse servidor, se ele exigir.                                                         |
| `OPENAI_COMPATIBLE_MODELS`   | Modelos desse servidor, separados por vírgula (ex.: `llama3.3,qwen3-coder`).                 |
| `OPENAI_MODEL`               | Modelo extra da OpenAI que não está no catálogo.                                             |
| `DOTY_DEFAULT_MODEL`         | Modelo padrão no formato `provedor:modelo`. Sem ele: `openai:$OPENAI_MODEL`, depois o primeiro disponível. |
| `DOTY_SUBAGENT_MODEL`        | Modelo dos subagentes. Sem ele, os subagentes usam o modelo da conversa.                     |

O catálogo ([provider-catalog.ts](api/src/llm/domain/provider-catalog.ts)) lista os modelos atuais de cada provedor com suas capacidades. Modelos que vêm só de variáveis de ambiente entram com capacidades conservadoras: ferramentas sim, imagens e raciocínio não.

- Se o modelo não aceita imagens, o chat não deixa colar imagens, e as imagens do histórico não são enviadas a ele.
- Ao trocar de provedor no meio de uma conversa, o raciocínio assinado pelo provedor anterior não é reenviado; chamadas de ferramenta e resultados são.
- Se a chave do provedor de uma conversa for removida, ela passa a usar o modelo padrão e o chat avisa.

## Workspace e dados

O agente só lê e escreve dentro das pastas permitidas. A raiz do projeto enviada pela interface precisa estar dentro de uma delas, senão a API responde `403`. Caminhos que saem da raiz (`../`, caminhos absolutos fora dela ou links simbólicos) são recusados.

| Variável               | Descrição                                                                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DOTY_WORKSPACE_ROOTS` | Pastas permitidas, separadas por vírgula. Sem ela, a API usa `BASE_CODE_PATH`, depois `/workspace` (Docker) e, por último, a pasta-pai deste repositório (com um aviso no log). |
| `DOTY_DATA_DIR`        | Dados do Doty, como a memória dos projetos. Padrão: `~/.doty`. Essa pasta nunca é acessível pelo agente, mesmo dentro de uma pasta permitida.                                |
| `DOTY_TEMPLATES_DIR`   | Pasta dos templates de projeto. Padrão: `templates/` na raiz do repositório.                                                                                               |

A memória dos projetos ficava em `api/storage/memory`. Na primeira inicialização ela é copiada para `$DOTY_DATA_DIR/memory`; a pasta antiga não é removida.

## Estrutura do repositório

```text
.
├── api/        # API NestJS, chat, ferramentas do agente e operações de projeto
├── ui/         # Interface React/Vite
├── templates/  # Templates usados na criação de projetos
└── docker-compose.yml
```

## Scripts principais

| Comando                    | Descrição                                                       |
| -------------------------- | --------------------------------------------------------------- |
| `npm run dev`              | Inicia frontend e backend em modo de desenvolvimento.           |
| `npm run build`            | Compila a API e o frontend.                                     |
| `npm start`                | Inicia a interface em modo preview e a API em modo de produção. |
| `npm test --prefix api`    | Executa os testes unitários da API.                             |
| `npm test --prefix ui`     | Executa os testes unitários do frontend (funções puras).        |
| `npm run lint --prefix ui` | Verifica o lint do frontend.                                    |

## API

- `GET /` — endpoint simples de disponibilidade.
- `GET /models` — provedores disponíveis (com chave configurada), seus modelos e o modelo padrão.
- `POST /chat` — recebe mensagens e transmite a resposta do agente. O campo opcional `model` (`provedor:modelo`) escolhe o modelo; um modelo indisponível responde `400`.
- `POST /project/create` — cria um projeto a partir de um template permitido.
- `POST /agent/bash-approvals/:id/approve` — aprova e executa um comando pendente.
- `POST /agent/bash-approvals/:id/reject` — rejeita um comando pendente.
- `POST /agent/bash-approvals/:id/revise` — rejeita o comando pendente e recebe uma sugestão alternativa.
