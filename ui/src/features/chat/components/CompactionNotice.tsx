import "@/styles/chat-usage.css";

/** Marks where older turns were summarized to fit the context window. */
export function CompactionNotice() {
  return (
    <p className="chat-compaction-notice" role="note">
      Older messages were summarized to fit the model's context.
    </p>
  );
}
