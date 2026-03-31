# Socket.IO Setup & Usage Guide

Dự án này sử dụng Socket.IO để cung cấp các tính năng real-time như chat, remote cursors, và presence indicators.

## 📋 Prerequisites

- Node.js 18+
- pnpm (hoặc npm/yarn)

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
pnpm install
```

Các dependencies chính:

- `socket.io`: Server WebSocket
- `socket.io-client`: Client WebSocket
- `express`: HTTP server
- `cors`: CORS middleware
- `geoip-lite`: Geolocation support

### 2. Configure Environment

Sao chép `.env.example` thành `.env.local` và cần thiết điều chỉnh:

```bash
cp .env.example .env.local
```

**Cấu hình mặc định cho development:**

```env
PORT=3001
CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### 3. Chạy Development

Có 2 options:

**Option A: Chạy cả Next.js và Socket.IO cùng lúc (Recommended)**

```bash
pnpm dev:all
```

Cái này sẽ chạy:

- Next.js dev server trên http://localhost:3000
- Socket.IO server trên http://localhost:3001

**Option B: Chạy riêng biệt**

Terminal 1 - Next.js:

```bash
pnpm dev
```

Terminal 2 - Socket.IO Server:

```bash
pnpm server:dev
```

## ✨ Features

### 1. **Live Chat** 💬

- Gửi và nhận tin nhắn real-time
- Message history (lưu 100 tin nhắn gần nhất)
- User avatars và colors

### 2. **Remote Cursors** 🖱️

- Xem con trỏ chuột của users khác
- User avatars displayed above cursors
- Disabled trên mobile (max-width: 768px)

### 3. **Online Users** 👥

- Xem danh sách users online
- User profiles với location và flags
- Presence indicators

### 4. **User Profiles** 👤

- Chỉnh sửa tên, avatar, màu
- Thông tin lưu trong localStorage
- Thông tin được restore khi reconnect

### 5. **Session Management** 🔑

- Tự động restore session khi reconnect
- Session ID lưu trong localStorage

### 6. **Typing Indicators** ✍️

- Xem khi users khác đang gõ
- Auto-clear sau 3 giây

## 🏗️ Architecture

### Server-side (server.ts)

**Events từ client:**

- `msg-send`: Gửi tin nhắn
- `cursor-change`: Cập nhật vị trí con trỏ
- `update-user`: Cập nhật profile user
- `typing-start`: Bắt đầu gõ
- `typing-end`: Dừng gõ

**Events gửi đến client:**

- `session`: Thông tin session
- `msgs-receive-init`: Tin nhắn lịch sử
- `msg-receive`: Tin nhắn mới
- `msg-delete`: Xóa tin nhắn
- `cursor-changed`: Con trỏ chuột update
- `users-updated`: Cập nhật danh sách users
- `user-typing`: User đang gõ
- `user-typing-stop`: User dừng gõ
- `warning`: System warnings

### Client-side (src/contexts/socketio.tsx)

**Context Type:**

```typescript
type SocketContextType = {
  socket: Socket | null;
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  msgs: Message[];
  setMsgs: Dispatch<SetStateAction<Message[]>>;
  isConnected: boolean;
  currentUser: User | undefined;
};
```

### Components

- **OnlineUsers** (`src/components/realtime/online-users.tsx`): Chat panel với list users
- **RemoteCursors** (`src/components/realtime/remote-cursors.tsx`): Hiển thị con trỏ chuột của users khác
- Realtime hooks:
  - `use-chat-scroll`: Tự động scroll chat
  - `use-sounds`: Khi nhận/gửi tin nhắn
  - `use-typing`: Typing indicators

## 🔌 Socket.IO API

### Client-side Usage

```typescript
import { useSocket } from "@/hooks/use-socket";

export function MyComponent() {
  const { socket, users, msgs, isConnected, currentUser } = useSocket();

  const sendMessage = (content: string) => {
    socket?.emit("msg-send", { content });
  };

  const updateProfile = (name: string, avatar: string) => {
    socket?.emit("update-user", { username: name, avatar });
  };

  return (
    <div>
      {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
      <p>Current user: {currentUser?.name}</p>
      <p>Online users: {users.filter(u => u.isOnline).length}</p>
    </div>
  );
}
```

### Session Restoration

```typescript
// Session ID được lưu tự động trong localStorage
// Khi reconnect, session sẽ được restore
const sessionId = localStorage.getItem("portfolio-site-session-id");
```

## 📦 Deployment

### Production Setup

1. **Update environment variables:**

```env
CLIENT_URL=https://yourdomain.com
NEXT_PUBLIC_WS_URL=https://yourdomain.com
```

2. **Build:**

```bash
pnpm build
```

3. **Start servers:**

```bash
# Terminal 1 - Next.js
pnpm start

# Terminal 2 - Socket.IO Server
node server.js
```

### Using Docker (Optional)

Tạo `Dockerfile` cho Socket.IO server:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod
COPY server.ts server.ts
RUN npx tsc server.ts
EXPOSE 3001
CMD ["node", "server.js"]
```

### Nginx Proxy (For WebSocket)

```nginx
location /socket.io {
  proxy_pass http://localhost:3001;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_cache_bypass $http_upgrade;
}
```

## 🐛 Troubleshooting

### Connection Issues

**Problem:** "Cannot connect to Socket.IO server"

**Solutions:**

1. Kiểm tra `NEXT_PUBLIC_WS_URL` trong `.env.local`
2. Chôi rằng Socket.IO server đang chạy (`pnpm server:dev`)
3. Kiểm tra port 3001 không đang sử dụng:

   ```bash
   # Windows
   netstat -ano | findstr :3001

   # macOS/Linux
   lsof -i :3001
   ```

### CORS Errors

**Problem:** "CORS policy: Access to XMLHttpRequest blocked"

**Solution:** Check `CLIENT_URL` và `NEXT_PUBLIC_WS_URL` trong server.ts CORS config

### Messages Not Showing

**Problem:** Chat messages không hiển thị

**Solutions:**

1. Refresh page
2. Kiểm tra browser console logs
3. Chắc chắn `isConnected` là `true` trong SocketContext

### Slow Performance

**Tips:**

1. Inspect network tab trong DevTools
2. Check server logs để thấy bottlenecks
3. Optimize message limit (hiện tại 100 messages)
4. Có thể dùng Message database (MongoDB, PostgreSQL) để lưu messages

## 📚 Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- [Express.js Guide](https://expressjs.com/)

## 🤝 Contributing

Nếu bạn muốn thêm new features hoặc fix bugs:

1. Check `server.ts` cho server-side events
2. Update `src/contexts/socketio.tsx` để handle new events
3. Tạo components hoặc hooks nếu cần

## 📝 Notes

- Messages được lưu in-memory (mất khi server restart)
- Để persist messages, integrate database như MongoDB
- Geolocation dựa trên client IP từ `geoip-lite`
- Typing indicators auto-clear sau 3s
- User session khôi phục tự động khi reconnect
