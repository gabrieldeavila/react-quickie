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
| `DOTY_SUBAGENT_MODEL`        | Modelo dos subagentes que não definem `model`. Sem ele, os subagentes usam o modelo da conversa. |
| `DOTY_SUMMARY_MODEL`         | Modelo (de preferência barato) que resume mensagens antigas quando a conversa enche o contexto. Sem ele, usa o modelo da conversa. |
| `DOTY_MAX_RETRIES`          | Novas tentativas por chamada ao modelo quando o provedor falha (limite de uso, sobrecarga). `0` desliga. Padrão: `2`. |

O catálogo ([provider-catalog.ts](api/src/llm/domain/provider-catalog.ts)) lista os modelos atuais de cada provedor com suas capacidades. Modelos que vêm só de variáveis de ambiente entram com capacidades conservadoras: ferramentas sim, imagens e raciocínio não.

- Se o modelo não aceita imagens, o chat não deixa colar imagens, e as imagens do histórico não são enviadas a ele.
- Ao trocar de provedor no meio de uma conversa, o raciocínio assinado pelo provedor anterior não é reenviado; chamadas de ferramenta e resultados são.
- Se a chave do provedor de uma conversa for removida, ela passa a usar o modelo padrão e o chat avisa.

### Uso, custo e contexto

- Cada resposta mostra os tokens e o custo estimado (`12.3k in · 1.1k out · $0.04`), calculado com os preços do catálogo. O total inclui os subagentes e os resumos de contexto, cada um com o preço do seu modelo; passe o mouse no rodapé para ver a divisão. Modelos sem preço fixo (DeepSeek, servidores compatíveis) mostram só os tokens. O cabeçalho mostra o total da conversa e quanto da janela de contexto do modelo ela ocupa.
- Acima de 75% da janela, a API primeiro remove o raciocínio e as chamadas de ferramenta antigas do que envia ao modelo. Se ainda não couber, resume as mensagens antigas (mantendo as duas últimas trocas) com `DOTY_SUMMARY_MODEL`. O histórico completo continua salvo no navegador; a conversa marca o ponto em que o resumo foi feito.
- Nos modelos da Anthropic, as instruções e a conversa usam cache de prompt, o que reduz o custo das chamadas seguidas de ferramentas.
- O botão de parar interrompe a resposta, os comandos de terminal, os subagentes e as chamadas MCP em andamento. Uma resposta interrompida não registra uso.

## Servidores MCP

O Doty usa ferramentas de servidores [MCP](https://modelcontextprotocol.io) (GitHub, bancos de dados, navegadores, documentação…). A configuração segue o formato do Claude/Cursor e vem de dois arquivos:

- global: `$DOTY_DATA_DIR/mcp.json` (padrão `~/.doty/mcp.json`);
- por projeto: `<raiz do projeto>/.doty/mcp.json`. Um servidor do projeto substitui o global de mesmo nome.

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" },
      "approval": "ask"
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "${DATABASE_URL}"],
      "approval": "never",
      "enabledTools": ["query"]
    }
  }
}
```

- Transportes: `stdio` (com `command`; roda na raiz do projeto) e `http`/`sse` (com `type` + `url`).
- `${VAR}` é lido do ambiente da API. Se uma variável não existir, o servidor fica com erro em vez de enviar um valor vazio.
- `approval`: `ask` (padrão; o chat pede permissão a cada chamada), `never`, ou um objeto por ferramenta (`{ "query": "never" }`; ferramentas fora dele pedem permissão).
- `enabledTools` / `disabledTools` filtram as ferramentas expostas.
- As ferramentas aparecem para o modelo como `mcp__<servidor>__<ferramenta>`, valem em todos os modos e cada resultado é limitado a ~50 mil caracteres.
- **Confiança:** um `mcp.json` de projeto pode executar qualquer comando, então ele fica desativado até você confiar nele em *Configurações → Servidores MCP*. Editar o arquivo revoga a confiança.
- Os servidores conectam na primeira mensagem do projeto, ficam conectados e fecham depois de ociosos. Um servidor com erro não impede o chat.

| Variável                      | Descrição                                                     |
| ----------------------------- | ------------------------------------------------------------- |
| `DOTY_MCP_CONNECT_TIMEOUT_MS` | Tempo máximo para conectar e listar ferramentas. Padrão: `10000`. |
| `DOTY_MCP_IDLE_TIMEOUT_MS`    | Fecha servidores sem uso após esse tempo. Padrão: `600000`.    |

Recursos, prompts, sampling e OAuth do MCP ainda não são suportados; use tokens em `headers`.

## Subagentes

O agente principal delega tarefas com `run_subagent`, escolhendo um tipo de agente. Cada tipo é um arquivo Markdown com frontmatter:

- embutidos: [api/src/subagents/definitions](api/src/subagents/definitions) — `explorer` (leitura), `reviewer` (leitura + Git) e `implementer` (edita arquivos e roda Bash);
- por projeto: `<raiz do projeto>/.doty/agents/*.md`. Um agente do projeto substitui o embutido de mesmo nome.

```md
---
name: docs
description: Atualiza a documentação. Use quando o código mudou e o README precisa acompanhar.
tools: [read_file, list_folders, edit_file, "mcp__github__*"]
model: inherit          # ou "anthropic:claude-haiku-5-5"
maxSteps: 15
writes: true
---
Você atualiza a documentação do projeto. …
```

- `tools` aceita globs. Subagentes nunca recebem `run_subagent`, e um agente com `writes: false` não recebe ferramentas de escrita nem Bash, mesmo que estejam na lista.
- **Aprovação:** delegar a um agente com `writes: true` pede aprovação na hora da delegação. Dentro do subagente, comandos Bash e ferramentas MCP que pediriam aprovação não rodam: voltam no resultado como "precisa de aprovação" para o agente principal executar pelo fluxo normal.
- O progresso (passos e texto) aparece ao vivo no card do subagente; o agente principal recebe só a resposta final.
- Modelo: `model` do agente → `DOTY_SUBAGENT_MODEL` → modelo da conversa → padrão. Um modelo sem chave configurada é ignorado.

| Variável                      | Descrição                                                         |
| ----------------------------- | ----------------------------------------------------------------- |
| `DOTY_MAX_PARALLEL_SUBAGENTS` | Subagentes rodando ao mesmo tempo; os demais esperam na fila. Padrão: `4`. |

## Workspace e dados

O agente só lê e escreve dentro das pastas permitidas. A raiz do projeto enviada pela interface precisa estar dentro de uma delas, senão a API responde `403`. Caminhos que saem da raiz (`../`, caminhos absolutos fora dela ou links simbólicos) são recusados.

| Variável               | Descrição                                                                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DOTY_WORKSPACE_ROOTS` | Pastas permitidas, separadas por vírgula. Sem ela, a API usa `BASE_CODE_PATH`, depois `/workspace` (Docker) e, por último, a pasta-pai deste repositório (com um aviso no log). |
| `DOTY_DATA_DIR`        | Dados do Doty, como a memória dos projetos. Padrão: `~/.doty`. Essa pasta nunca é acessível pelo agente, mesmo dentro de uma pasta permitida.                                |
| `DOTY_TEMPLATES_DIR`   | Pasta dos templates de projeto. Padrão: `templates/` na raiz do repositório.                                                                                               |

A memória dos projetos ficava em `api/storage/memory`. Na primeira inicialização ela é copiada para `$DOTY_DATA_DIR/memory`; a pasta antiga não é removida.

## Acesso à API

| Variável               | Descrição |
| ---------------------- | --------- |
| `DOTY_AUTH_TOKEN`      | Quando definida, toda requisição precisa de `Authorization: Bearer <token>` (senão `401`). A extensão VSCode gera um token aleatório a cada sessão. |
| `DOTY_ALLOWED_ORIGINS` | Origens CORS permitidas, separadas por vírgula. Padrão: `http://localhost:5173,http://localhost:4173`. `UI_URL` é sempre adicionada; `vscode-webview://` só é aceita com `DOTY_AUTH_TOKEN`. |
| `DOTY_HOST`            | Interface onde a API escuta (ex.: `127.0.0.1`). Padrão: todas. |
| `DOTY_API_BASE_DIR`    | Pasta das skills e definições de subagentes quando a API roda empacotada (usada pela extensão VSCode). |

## Extensão VSCode

O pacote `vscode/` roda a API e a mesma interface dentro do editor (barra lateral). Instalação, comandos e configurações: [vscode/README.md](vscode/README.md).

```bash
npm run build
npm run package --prefix vscode
code --install-extension vscode/doty.vsix
```

## Estrutura do repositório

```text
.
├── api/        # API NestJS, chat, ferramentas do agente e operações de projeto
├── ui/         # Interface React/Vite
├── vscode/     # Extensão VSCode (inicia a API e mostra a interface num webview)
├── templates/  # Templates usados na criação de projetos
└── docker-compose.yml
```

## Scripts principais

| Comando                    | Descrição                                                       |
| -------------------------- | --------------------------------------------------------------- |
| `npm run dev`              | Inicia frontend e backend em modo de desenvolvimento.           |
| `npm run build`            | Compila a API, o frontend e a extensão VSCode.                  |
| `npm start`                | Inicia a interface em modo preview e a API em modo de produção. |
| `npm test --prefix api`    | Executa os testes unitários da API.                             |
| `npm test --prefix ui`     | Executa os testes unitários do frontend (funções puras).        |
| `npm run lint --prefix ui` | Verifica o lint do frontend.                                    |
| `npm test --prefix vscode` | Executa os testes unitários da extensão.                        |
| `npm run package --prefix vscode` | Gera `vscode/doty.vsix` (rode `npm run build` antes).    |

## API

- `GET /` — endpoint simples de disponibilidade.
- `GET /models` — provedores disponíveis (com chave configurada), seus modelos e o modelo padrão.
- `POST /chat` — recebe mensagens e transmite a resposta do agente. O campo opcional `model` (`provedor:modelo`) escolhe o modelo; um modelo indisponível responde `400`.
- `GET /mcp/servers?root=` — servidores MCP do projeto: estado, número de ferramentas e confiança.
- `POST /mcp/trust` — confia no `.doty/mcp.json` do projeto (`{ root, hash }`; responde `409` se o arquivo mudou).
- `POST /mcp/:name/reconnect` — reconecta um servidor MCP (`{ root }`).
- `POST /project/create` — cria um projeto a partir de um template permitido.
- `POST /agent/bash-approvals/:id/approve` — aprova e executa um comando pendente.
- `POST /agent/bash-approvals/:id/reject` — rejeita um comando pendente.
- `POST /agent/bash-approvals/:id/revise` — rejeita o comando pendente e recebe uma sugestão alternativa.
