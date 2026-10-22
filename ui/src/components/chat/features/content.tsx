import { memo } from "react";
import ChatMain from "./main";
import { ChatModalSettings } from "./modal/settings";
import { ChatModalNewProject } from "./modal/newProject";
import { ChatModalInstructions } from "./modal/instructions";
import { ChatModalMcp } from "./modal/mcp";
import { ChatSignInPopup } from "./modal/sign-in-popup";

const ChatContent = memo(() => {
  return (
    <main className="chat-shell">
      <section className="chat-container">
        <ChatMain />
      </section>

      <ChatModalSettings />
      <ChatModalNewProject />
      <ChatModalInstructions />
      <ChatModalMcp />
      <ChatSignInPopup />
    </main>
  );
});

export default ChatContent;
