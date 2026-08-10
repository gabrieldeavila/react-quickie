import { ChatBaseProvider } from "./context/ChatBaseContext";
import { ChatServicesProvider } from "./context/ChatServicesContext";
import ChatContent from "./features/content";
import "../../styles/ChatInterface.css";

const Chat = () => {
  return (
    <ChatBaseProvider>
      <ChatServicesProvider>
        <ChatContent />
      </ChatServicesProvider>
    </ChatBaseProvider>
  );
};

export default Chat;
