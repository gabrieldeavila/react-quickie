# doty

**doty** é um assistente de desenvolvimento com interface de chat para trabalhar em projetos dentro de um workspace local. Ele combina um frontend React com uma API NestJS e um modelo compatível com a integração OpenAI do AI SDK. O agente pode ajudar a entender e modificar projetos, executar ferramentas de desenvolvimento e criar projetos a partir de templates.

## Funcionalidades

- Chat com streaming de respostas e contexto do projeto selecionado.
- Modos especializados para tarefas de frontend e Git, além das ferramentas gerais do agente.
- Ferramentas para consultar e alterar arquivos, trabalhar com projetos e executar comandos Bash.
- Aprovação explícita para comandos Bash que exigem confirmação; comandos considerados arriscados não são executados silenciosamente.
- Criação de projetos com os templates `vite-base`, `next-base`, `nest-base` e `nest-vite-base` (NestJS + Vite).
- Execução de tarefas delegadas a subagentes e suporte a modo de planejamento.

> **Segurança:** doty foi projetado para uso local e não substitui o isolamento de um sandbox. Configure o workspace para uma pasta confiável e revise os comandos antes de aprová-los. Não exponha a API publicamente sem adicionar os controles de autenticação e segurança adequados.

## Tecnologias

- **Frontend:** React 19, TypeScript, Vite e AI SDK.
- **Backend:** NestJS 11, TypeScript e AI SDK para integração com modelos.
- **Modelo:** configuração via `OPENAI_KEY` e `OPENAI_MODEL`.
- **Persistência local:** IndexedDB no navegador para dados do chat.
- **Containers:** Docker Compose para executar a interface e a API.

## Requisitos

- Node.js 24 (a versão usada nas imagens Docker do projeto).
- npm.
- Uma chave de API compatível com o provider OpenAI usado pelo backend.
- Docker e Docker Compose, somente para a execução containerizada.

## Configuração local

1. Instale as dependências a partir da raiz do repositório:

   ```bash
   npm install
   ```

   O script `postinstall` instala também as dependências de `api/` e `ui/`.

2. Crie `api/.env` com as configurações do modelo:

   ```dotenv
   OPENAI_KEY=sua-chave-de-api
   OPENAI_MODEL=nome-do-modelo
   ```

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

2. Crie `api/.env` com `OPENAI_KEY` e `OPENAI_MODEL`, como mostrado na configuração local.

3. Construa e inicie os serviços:

   ```bash
   docker compose up -d --build
   ```

A interface será exposta em `http://localhost:8080` e a API em `http://localhost:4000`. Os projetos criados ou acessados pelo backend ficam no diretório do host configurado em `BASE_CODE_PATH`.

Para interromper os serviços:

```bash
docker compose down
```

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
| `npm run lint --prefix ui` | Verifica o lint do frontend.                                    |

## API

- `GET /` — endpoint simples de disponibilidade.
- `POST /chat` — recebe mensagens e transmite a resposta do agente.
- `POST /project/create` — cria um projeto a partir de um template permitido.
- `POST /agent/bash-approvals/:id/approve` — aprova e executa um comando pendente.
- `POST /agent/bash-approvals/:id/reject` — rejeita um comando pendente.
- `POST /agent/bash-approvals/:id/revise` — rejeita o comando pendente e recebe uma sugestão alternativa.
