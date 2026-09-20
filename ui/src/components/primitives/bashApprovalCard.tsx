import type { UIMessage } from "ai";
import { useState } from "react";
import { useChatBaseContext } from "../chat/context/context";
import { CHAT_API_URL } from "~types/consts/project.const";

type Props = {
  approvalId: string;
  command: string;
  cwd: string;
  reason: string;
  completed?: boolean;
};

const APPROVAL_CONTROL_PREFIX = "[bash-approval-control]";

export function BashApprovalCard({
  approvalId,
  command,
  cwd,
  reason,
  completed = false,
}: Props) {
  const { sendMessageRef, setMessages, history, activeConversationId } =
    useChatBaseContext();
  const [alternative, setAlternative] = useState("");
  const [status, setStatus] = useState<"pending" | "loading" | "done">(
    completed ? "done" : "pending",
  );

  const resolve = async (action: "approve" | "reject" | "revise") => {
    if (action === "revise" && !alternative.trim()) return;
    setStatus("loading");

    const response = await fetch(
      `${CHAT_API_URL.replace(/\/chat$/, "")}/agent/bash-approvals/${approvalId}/${action}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:
          action === "revise"
            ? JSON.stringify({ command: alternative.trim() })
            : undefined,
      },
    );
    const result = (await response.json()) as {
      decision?: string;
      result?: unknown;
      command?: string;
    };
    setStatus("done");

    if (!sendMessageRef.current) return;
    const resultText =
      typeof result.result === "string"
        ? result.result
        : JSON.stringify(result.result ?? "");
    const continuation =
      action === "approve"
        ? `${APPROVAL_CONTROL_PREFIX} O usuário aprovou a execução de ${command}. Resultado do Bash:\n${resultText}\nContinue a tarefa.`
        : action === "reject"
          ? `${APPROVAL_CONTROL_PREFIX} O usuário negou a execução de ${command}. Não execute esse comando e continue de outra forma.`
          : `${APPROVAL_CONTROL_PREFIX} O usuário não quer executar ${command}. Considere este comando alternativo sugerido pelo usuário: ${alternative.trim()}`;
    await sendMessageRef.current({ text: continuation });

    if (action === "approve") {
      const resultPart = {
        type: "tool-run_bash_command",
        state: "output-available",
        input: { command },
        output: result.result,
        approvalId,
      } as unknown as UIMessage["parts"][number];

      // O resultado entra no topo da última mensagem do agente, antes do texto
      // que ele produziu após receber o contexto da aprovação.
      setMessages((messages) => {
        let assistantIndex = -1;

        for (let index = messages.length - 1; index >= 0; index -= 1) {
          if (messages[index]?.role === "assistant") {
            assistantIndex = index;
            break;
          }
        }

        if (assistantIndex < 0) return messages;

        return messages.map((message, index) =>
          index === assistantIndex
            ? {
                ...message,
                parts: [resultPart, ...message.parts],
              }
            : message,
        );
      });

      if (activeConversationId) {
        await history.appendAssistantParts(activeConversationId, [resultPart]);
      }
    }
  };

  return (
    <div className="bash-approval-card" role="alert">
      <strong>O agente precisa de permissão para executar:</strong>
      <pre>{command}</pre>
      <small>{cwd}</small>
      <p>{reason}</p>
      {status === "pending" ? (
        <>
          <div className="bash-approval-actions">
            <button
              className="bash-approval-button bash-approval-button--approve"
              type="button"
              onClick={() => void resolve("approve")}
            >
              Permitir
            </button>
            <button
              className="bash-approval-button bash-approval-button--reject"
              type="button"
              onClick={() => void resolve("reject")}
            >
              Negar
            </button>
          </div>
          <div className="bash-approval-revise">
            <input
              value={alternative}
              onChange={(event) => setAlternative(event.target.value)}
              placeholder="Ou informe outro comando"
              aria-label="Outro comando Bash"
            />
            <button
              className="bash-approval-button bash-approval-button--revise"
              type="button"
              onClick={() => void resolve("revise")}
            >
              Enviar alternativa
            </button>
          </div>
        </>
      ) : (
        <small>Solicitação processada.</small>
      )}
    </div>
  );
}
