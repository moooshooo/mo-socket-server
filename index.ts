import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";

// Skapa socket-engine
const engine = new Engine({
  path: "/socket.io/",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Initiera Socket.IO-server
const io = new Server();
io.bind(engine);

// När en klient ansluter
io.on("connection", (socket) => {
  const clientID = socket.id;
  const time = new Date().toLocaleString("sv-SE");

  console.log(`✅ Ny anslutning: ${clientID} (${time})`);
  console.log(`👥 Totalt anslutna: ${io.engine.clientsCount}`);

  // 1️⃣ Hälsa den nya användaren personligen
  socket.emit("welcome_message", {
    msg: "Välkommen till Chasqui.se!",
    id: clientID,
    connectedAt: time,
  });

  // 2️⃣ Informera alla andra att någon ny anslutit
  socket.broadcast.emit("new_user_connected", {
    msg: `Ny användare anslöt: ${clientID}`,
    total: io.engine.clientsCount,
  });

  // 3️⃣ Logga alla inkommande event
  socket.onAny((event, data) => {
    console.log(`📨 Event från ${clientID}: ${event}`, data);
    socket.broadcast.emit(event, data);
  });

  // 4️⃣ När klienten kopplar ner
  socket.on("disconnect", () => {
    console.log(`❌ Klient bortkopplad: ${clientID}`);
    console.log(`👥 Kvarvarande: ${io.engine.clientsCount}`);

    io.emit("user_disconnected", {
      id: clientID,
      remaining: io.engine.clientsCount,
    });
  });
});

// 🔥 Starta servern
const port = parseInt(process.env.PORT || "3001", 10);
console.log(`🚀 Bun + Socket.IO server startar på port ${port}`);

Bun.serve({
  port,
  ...engine.handler(),
});
