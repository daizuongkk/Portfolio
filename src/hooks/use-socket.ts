import { useContext } from "react";
import { SocketContext } from "@/contexts/socketio";

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within SocketContextProvider");
  }

  return context;
};
