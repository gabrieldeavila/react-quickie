import { memo } from "react";
import ChatHeader from "./header";
import ChatMessagesList from "./messages";
import { ChatComposer } from "./composer";

const ChatMain = memo(() => {
  return (
    <section className="chat-main">
      <ChatHeader />
      <ChatMessagesList />
      <ChatComposer />
    </section>
  );
});

export default ChatMain;
