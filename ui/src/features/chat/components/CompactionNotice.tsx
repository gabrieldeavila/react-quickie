import "@/styles/chat-usage.css";

/** Marks where older turns were summarized to fit the context window. */
export function CompactionNotice() {
  return (
    <p className="chat-compaction-notice" role="note">
      Mensagens antigas resumidas para caber no contexto do modelo.
    </p>
  );
}
