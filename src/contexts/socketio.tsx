"use client";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/components/ui/use-toast";

export type User = {
  id: string;
  socketId: string;
  name: string;
  avatar: string;
  color: string;
  isOnline: boolean;
  posX: number;
  posY: number;
  location: string;
  flag: string;
  lastSeen: string;
  createdAt: string;
};

export type Message = {
  id: string;
  sessionId: string;
  flag: string;
  country: string;
  username: string;
  avatar: string;
  color?: string;
  content: string;
  createdAt: string | Date;
};

type SocketContextType = {
  socket: Socket | null;
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  msgs: Message[];
  setMsgs: Dispatch<SetStateAction<Message[]>>;
  isConnected: boolean;
  currentUser: User | undefined;
};

const INITIAL_STATE: SocketContextType = {
  socket: null,
  users: [],
  setUsers: () => {},
  msgs: [],
  setMsgs: () => {},
  isConnected: false,
  currentUser: undefined,
};

export const SocketContext = createContext<SocketContextType>(INITIAL_STATE);

const SESSION_ID_KEY = "portfolio-site-session-id";

const SocketContextProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // SETUP SOCKET.IO
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_WS_URL) {
      console.warn(
        "⚠️ NEXT_PUBLIC_WS_URL is not configured. Realtime features are disabled.",
      );
      return;
    }

    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      autoConnect: true,
      auth: {
        sessionId: localStorage.getItem(SESSION_ID_KEY),
      },
    });

    setSocket(socketInstance);

    // Connection events
    socketInstance.on("connect", () => {
      console.log("✅ Connected to Socket.IO server");
      setIsConnected(true);

      // Load user preferences from localStorage
      const savedName = localStorage.getItem("username");
      const savedAvatar = localStorage.getItem("avatar");
      const savedColor = localStorage.getItem("color");

      if (savedName || savedAvatar || savedColor) {
        socketInstance.emit("update-user", {
          username: savedName,
          avatar: savedAvatar,
          color: savedColor,
        });
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.IO server");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("💥 Connection error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description:
          "Failed to connect to the server. Some features may be limited.",
      });
    });

    // Message events
    socketInstance.on("msgs-receive-init", (msgs: Message[]) => {
      console.log(`📨 Received ${msgs.length} messages`);
      setMsgs(msgs);
    });

    socketInstance.on("msg-receive", (msg: Message) => {
      console.log("💬 New message:", msg.username, msg.content);
      setMsgs((prev) => [...prev, msg]);
    });

    socketInstance.on("msg-delete", (data: { id: string }) => {
      console.log("🗑️ Message deleted:", data.id);
      setMsgs((prev) => prev.filter((m) => m.id !== data.id));
    });

    // Session event
    socketInstance.on("session", ({ sessionId }: { sessionId: string }) => {
      console.log("🔑 Session established:", sessionId);
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    });

    // User events
    socketInstance.on("users-updated", (updatedUsers: User[]) => {
      console.log("👥 Users updated:", updatedUsers.length);
      setUsers(updatedUsers);
    });

    // Warning events
    socketInstance.on("warning", (data: { message: string }) => {
      console.warn("⚠️ Server warning:", data.message);
      toast({
        variant: "destructive",
        title: "System Warning",
        description: data.message,
      });
    });

    // Error events
    socketInstance.on("error", (error: any) => {
      console.error("❌ Socket error:", error);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [toast]);

  const currentUser = users.find((u) => u.socketId === socket?.id);

  return (
    <SocketContext.Provider
      value={{
        socket,
        users,
        setUsers,
        msgs,
        setMsgs,
        isConnected,
        currentUser,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;
