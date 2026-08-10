import { memo } from "react";
import { useChatBaseContext } from "../context/context";
import ChatSidebar from "./sidebar";
import ChatMain from "./main";
import { ChatModalSettings } from "./modal/settings";
import { ChatModalNewProject } from "./modal/newProject";

const ChatContent = memo(() => {
  const { isSidebarOpen } = useChatBaseContext();

  return (
    <main className="chat-shell">
      <section
        className={`chat-container ${isSidebarOpen ? "chat-container--sidebar-open" : "chat-container--sidebar-closed"}`}
      >
        <ChatSidebar />
        <ChatMain />
      </section>

      <ChatModalSettings />
      <ChatModalNewProject />
    </main>
  );
});

export default ChatContent;
