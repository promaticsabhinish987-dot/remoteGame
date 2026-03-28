const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {}; // roomId → monitorSocketId

io.on("connection", socket => {
  console.log("User connected:", socket.id);

  // Monitor creates room
  socket.on("createRoom", () => {
    const roomId = Math.random().toString(36).substring(2, 7);
    rooms[roomId] = socket.id;
    socket.join(roomId);

    socket.emit("roomCreated", roomId);
  });

  // Remote joins room
  socket.on("joinRoom", roomId => {
    if (rooms[roomId]) {
      socket.join(roomId);
      socket.emit("joinedRoom", roomId);
    } else {
      socket.emit("errorRoom", "Room not found");
    }
  });

  // Remote sends input → forward to monitor
  socket.on("input", ({ roomId, keys }) => {
    socket.to(roomId).emit("input", keys);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});