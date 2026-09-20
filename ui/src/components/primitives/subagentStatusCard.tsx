import { FiCheck, FiLoader, FiX } from "react-icons/fi";
import type { SubagentStatus } from "~types/interface/chat.interface";
import "@/styles/subagent-status.css";

function StatusIcon({ status }: { status: SubagentStatus["status"] }) {
  if (status === "completed") return <FiCheck aria-hidden="true" />;
  if (status === "failed") return <FiX aria-hidden="true" />;
  return <FiLoader className="subagent-status__spinner" aria-hidden="true" />;
}

export function SubagentStatusCard({ agents }: { agents: SubagentStatus[] }) {
  if (!agents.length) return null;

  const activeCount = agents.filter(
    (agent) => agent.status === "running",
  ).length;

  return (
    <section className="subagent-status" aria-label="Subagentes">
      <header className="subagent-status__header">
        <span>Subagentes</span>
        <span className="subagent-status__count">
          {activeCount ? `${activeCount} em execução` : "concluídos"}
        </span>
      </header>
      <div className="subagent-status__list">
        {agents.map((agent) => (
          <div className="subagent-status__item" key={agent.id}>
            <span className={`subagent-status__icon is-${agent.status}`}>
              <StatusIcon status={agent.status} />
            </span>
            <span className="subagent-status__body">
              <strong>{agent.name}</strong>
              <span>{agent.task}</span>
            </span>
            <span className="subagent-status__state">
              {agent.status === "running"
                ? "executando"
                : agent.status === "completed"
                  ? "concluído"
                  : "falhou"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
