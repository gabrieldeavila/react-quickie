import { createContext, useContext } from "react";
import type {
  ChatBaseContextValue,
  ChatServicesContextValue,
} from "../../../types/interface/chat-context.interface";

export const ChatBaseContext = createContext<ChatBaseContextValue | null>(null);

export const ChatServicesContext =
  createContext<ChatServicesContextValue | null>(null);

export const useChatBaseContext = () => {
  const context = useContext(ChatBaseContext);

  if (!context) {
    throw new Error("useChatBaseContext must be used within a ChatBaseContext");
  }

  return context;
};

export const useChatServicesContext = () => {
  const context = useContext(ChatServicesContext);

  if (!context) {
    throw new Error(
      "useChatServicesContext must be used within a ChatServicesContext",
    );
  }

  return context;
};
