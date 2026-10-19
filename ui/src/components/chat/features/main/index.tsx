import { memo } from "react";
import { getHostFeatures } from "@/host/domain/host-features";
import { getRuntimeConfig } from "@/host/runtime-config";
import ChatHeader from "./header";
import ChatMessagesList from "./messages";
import { ChatComposer } from "./composer";
import ViewTitleActions from "./viewTitleActions";
import { useChatShortcuts } from "../../hooks/events/useChatShortcuts";

const { hasViewTitleActions } = getHostFeatures(getRuntimeConfig().host);

const ChatMain = memo(() => {
  useChatShortcuts();

  return (
    <section className="chat-main">
      {hasViewTitleActions ? <ViewTitleActions /> : <ChatHeader />}
      <ChatMessagesList />
      <ChatComposer />
    </section>
  );
});

export default ChatMain;
