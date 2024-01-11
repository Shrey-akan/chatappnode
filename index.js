const express = require("express");
const http = require("http");
const app = express();
const port = process.env.PORT || 4444;
const server = http.createServer(app);
const io = require("socket.io")(server);

// Middleware
app.use(express.json());
const clients = {};

io.on("connection", (socket) => {
  console.log("connected");
  console.log(socket.id, "has joined");

  socket.on("signin", (id) => {
    console.log(id);
    clients[id] = socket;
    console.log(clients);
  });

  socket.on("message", (msg) => {
    try {
      console.log("Received message:", msg);
      const targetId = msg.targetId;
      if (clients[targetId]) clients[targetId].emit("message", msg);
    } catch (error) {
      console.error("Error handling message:", error);
      socket.emit("error", "Error handling the message");
    }
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log("server started");
});
