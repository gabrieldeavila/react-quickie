import { memo } from "react";
import { getHostFeatures } from "@/host/domain/host-features";
import { getRuntimeConfig } from "@/host/runtime-config";
import ChatHeader from "./header";
import ChatMessagesList from "./messages";
import { ChatComposer } from "./composer";
import ViewTitleActions from "./viewTitleActions";

const { hasViewTitleActions } = getHostFeatures(getRuntimeConfig().host);

const ChatMain = memo(() => {
  return (
    <section className="chat-main">
      {hasViewTitleActions ? <ViewTitleActions /> : <ChatHeader />}
      <ChatMessagesList />
      <ChatComposer />
    </section>
  );
});

export default ChatMain;
