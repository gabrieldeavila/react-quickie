# Doty para VSCode

O chat do Doty na barra lateral do VSCode. A extensão inicia a API do Doty com o Node do próprio VSCode (não precisa ter Node instalado) e mostra a mesma interface num webview. As ferramentas só agem nas pastas abertas no workspace.

## Instalação (`.vsix` local)

Na raiz do repositório:

```bash
npm install
npm run build              # api, ui e vscode
npm run package --prefix vscode
code --install-extension vscode/doty.vsix
```

Depois abra uma pasta, rode **Doty: Set API key** e clique no ícone do Doty na barra de atividades.

## Comandos

| Comando | O que faz |
|---|---|
| Doty: Set API key | Guarda a chave da Anthropic, OpenAI, DeepSeek ou de um servidor OpenAI-compatible no chaveiro do sistema (SecretStorage) e reinicia a API. |
| Doty: Ask about selection | Manda o código selecionado (arquivo e linhas) para o campo de mensagem. Também está no menu de contexto do editor. |
| Doty: Restart API | Reinicia a API e recarrega a view. |
| Doty: Show logs | Mostra a saída da API (canal "Doty"). |

## Configurações

- `doty.defaultModel`: modelo padrão no formato `provedor:modelo` (o mesmo que `DOTY_DEFAULT_MODEL`).
- `doty.openaiCompatible.baseUrl` e `doty.openaiCompatible.models`: servidor OpenAI-compatible.

## Como funciona

- A API escuta em `127.0.0.1`, numa porta livre, e exige um token aleatório (`DOTY_AUTH_TOKEN`) em toda requisição.
- `DOTY_WORKSPACE_ROOTS` recebe as pastas do workspace. Com várias pastas, escolha uma nas configurações do chat.
- Os dados (memória, confiança MCP, `mcp.json` global) ficam no armazenamento da extensão, não em `~/.doty`.
- O histórico das conversas fica no IndexedDB do webview e é separado do histórico da interface no navegador.
- Se a API cair, ela é reiniciada com espera crescente; depois de 5 quedas seguidas, use **Doty: Restart API**.
- Indisponível no VSCode: **Novo projeto** (os templates não vão no pacote) e o modo **Agent Builder** (ele edita o código-fonte do próprio Doty).
