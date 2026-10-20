import { memo } from "react";
import ChatMain from "./main";
import { ChatModalSettings } from "./modal/settings";
import { ChatModalNewProject } from "./modal/newProject";
import { ChatModalInstructions } from "./modal/instructions";

const ChatContent = memo(() => {
  return (
    <main className="chat-shell">
      <section className="chat-container">
        <ChatMain />
      </section>

      <ChatModalSettings />
      <ChatModalNewProject />
      <ChatModalInstructions />
    </main>
  );
});

export default ChatContent;
