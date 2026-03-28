const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// 🔥 ADDED: faster transport
const io = new Server(server, {
  transports: ["websocket"]
});

app.use(express.static("public"));

const rooms = {};

io.on("connection", socket => {
  console.log("User connected:", socket.id);

  socket.on("createRoom", () => {
    const roomId = Math.random().toString(36).substring(2, 7);
    rooms[roomId] = socket.id;
    socket.join(roomId);

    socket.emit("roomCreated", roomId);
  });

  socket.on("joinRoom", roomId => {
    if (rooms[roomId]) {
      socket.join(roomId);
      socket.emit("joinedRoom", roomId);
    } else {
      socket.emit("errorRoom", "Room not found");
    }
  });

  // ❌ OLD (KEPT BUT DISABLED)
  // socket.on("input", ({ roomId, keys }) => {
  //   const monitorId = rooms[roomId];
  //   if (monitorId) {
  //     io.to(monitorId).emit("input", keys);
  //   }
  // });

  // 🔥 NEW FAST INPUT (ADDED)
  socket.on("input_fast", ({ roomId, key, state }) => {
    const monitorId = rooms[roomId];

    if (monitorId) {
      io.to(monitorId).emit("input_fast", { key, state });
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://0.0.0.0:3000");
});
