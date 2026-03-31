import cors from "cors";
import express from "express";
import geoip from "geoip-lite";
import http from "http";
import { Server as IOServer } from "socket.io";

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://www.daizuongkk.id.vn",
  "https://daizuongkk.id.vn",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter((origin): origin is string => typeof origin === 'string' && origin.length > 0);

console.log("🔐 [STARTUP] Allowed Origins:", allowedOrigins);

// Middleware - Allow all origins for CORS
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const server = http.createServer(app);

const io = new IOServer(server, {
  cors: {
    origin: true, // Allow all origins - Socket.IO will work with polling/websocket
    methods: ["GET", "POST"],
    credentials: true,
    allowEIO3: true,
    transports: ['websocket', 'polling'],
  },
});

// Types
interface UserSession {
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
  lastSeen: Date;
  createdAt: Date;
  sessionId: string;
}

interface Message {
  id: string;
  sessionId: string;
  flag: string;
  country: string;
  username: string;
  avatar: string;
  color?: string;
  content: string;
  createdAt: Date;
}

// Store
const sessions = new Map<string, UserSession>();
const messages: Message[] = [];
const MAX_MESSAGES = 100;

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const getLocationInfo = (ip: string) => {
  try {
    const geo = geoip.lookup(ip);
    if (geo) {
      return {
        country: geo.country || "Unknown",
        location: geo.city || geo.country || "Unknown",
        flag: getCountryFlag(geo.country || ""),
      };
    }
  } catch (error) {
    console.error("Geolocation error:", error);
  }
  return {
    country: "Unknown",
    location: "Unknown",
    flag: "🌍",
  };
};

const getCountryFlag = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const generateColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
};

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log(`✅ [SOCKET] User connected: ${socket.id}`);
  console.log(`   Origin: ${socket.request.headers.origin}`);

  const clientIp =
    (socket.request.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    socket.request.socket.remoteAddress ||
    "Unknown";

  const { location, country, flag } = getLocationInfo(clientIp);
  const color = generateColor();

  // Handle session restoration
  const authSessionId = (socket.handshake.auth.sessionId as string) || null;
  let userSession: UserSession;

  if (authSessionId && sessions.has(authSessionId)) {
    userSession = sessions.get(authSessionId)!;
    userSession.socketId = socket.id;
    userSession.isOnline = true;
  } else {
    const sessionId = generateId();
    userSession = {
      id: generateId(),
      socketId: socket.id,
      name: `Guest-${socket.id.slice(0, 5)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${socket.id}`,
      color,
      isOnline: true,
      posX: 0,
      posY: 0,
      location,
      flag,
      lastSeen: new Date(),
      createdAt: new Date(),
      sessionId,
    };
    sessions.set(sessionId, userSession);
  }

  // Emit session info
  socket.emit("session", {
    sessionId: userSession.sessionId,
  });

  // Emit initial messages and users
  socket.emit("msgs-receive-init", messages);
  io.emit("users-updated", Array.from(sessions.values()));

  // Listen to cursor position updates
  socket.on("cursor-change", (data) => {
    const user = sessions.get(
      Array.from(sessions.entries()).find(
        ([_, u]) => u.socketId === socket.id,
      )?.[0] || "",
    );
    if (user) {
      user.posX = data.pos.x;
      user.posY = data.pos.y;
      socket.broadcast.emit("cursor-changed", {
        socketId: socket.id,
        pos: data.pos,
      });
    }
  });

  // Listen to messages
  socket.on("msg-send", (data: { content: string }) => {
    if (!userSession) return;

    const message: Message = {
      id: generateId(),
      sessionId: userSession.sessionId,
      flag: userSession.flag,
      country: userSession.location,
      username: userSession.name,
      avatar: userSession.avatar,
      color: userSession.color,
      content: data.content,
      createdAt: new Date(),
    };

    messages.push(message);

    // Keep messages under limit
    if (messages.length > MAX_MESSAGES) {
      messages.shift();
    }

    io.emit("msg-receive", message);
  });

  // Listen to user profile updates
  socket.on("update-user", (data) => {
    const sessionKey = Array.from(sessions.entries()).find(
      ([_, u]) => u.socketId === socket.id,
    )?.[0];
    if (sessionKey) {
      const user = sessions.get(sessionKey)!;
      user.name = data.username || user.name;
      user.avatar = data.avatar || user.avatar;
      if (data.color) user.color = data.color;
      io.emit("users-updated", Array.from(sessions.values()));
    }
  });

  // Listen to typing indicator
  socket.on("typing-start", () => {
    socket.broadcast.emit("user-typing", {
      socketId: socket.id,
      username: userSession.name,
    });
  });

  socket.on("typing-end", () => {
    socket.broadcast.emit("user-typing-stop", {
      socketId: socket.id,
    });
  });

  // Listen to disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Mark user as offline instead of removing
    const sessionKey = Array.from(sessions.entries()).find(
      ([_, u]) => u.socketId === socket.id,
    )?.[0];
    if (sessionKey) {
      const user = sessions.get(sessionKey)!;
      user.isOnline = false;
      user.lastSeen = new Date();
    }

    io.emit("users-updated", Array.from(sessions.values()));
  });

  // Add warning event for rate limiting or other issues
  if (io.engine.clientsCount > 100) {
    socket.emit("warning", {
      message:
        "Server is experiencing high load. Some features may be limited.",
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", connectedUsers: sessions.size });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n✅ Server Configuration:`);
  console.log(`   CLIENT_URL: ${process.env.CLIENT_URL || '(not set)'}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || '(not set)'}`);
  console.log(`   Allowed Origins: ${allowedOrigins.join(", ")}`);
  console.log(`\n📍 Access Socket.IO at: http://localhost:${PORT}`);
  console.log(`${'='.repeat(60)}\n`);
});
