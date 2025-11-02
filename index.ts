import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";

const engine = new Engine({
  path: "/socket.io/",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const io = new Server();

io.bind(engine);

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // Skicka IP och välkomstmeddelande till klienten
  io.emit("cir_ter", {
    ip: socket.handshake.address,
    msg: "Välkommen till Chasqui.se",
    id: socket.id,
  });

  socket.onAny((event, data) => {
    console.log(`📨 Event: ${event}`, data);
    socket.broadcast.emit(event, data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// **Explicit start**
const port = parseInt(process.env.PORT || "3001", 10);
console.log(`🚀 Starting Bun + Socket.IO server on port ${port}`);
Bun.serve({
  port,
  ...engine.handler(),
});
