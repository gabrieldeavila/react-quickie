import { ChatStatusPill } from "./ChatStatusPill";

type ChatHeaderProps = {
  title: string;
  subtitle?: string;
  status?: string;
};

export function ChatHeader({ title, subtitle, status = "Online" }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="chat-header__top">
        <div>
          <div className="chat-header__eyebrow">AI Assistant</div>
          <h1 className="chat-title">{title}</h1>
        </div>

        <ChatStatusPill label={status} />
      </div>

      {subtitle ? <p className="chat-subtitle">{subtitle}</p> : null}
    </header>
  );
}
