const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4444;
const server = http.createServer(app);
const io = require("socket.io")(server);
app.use(express.json());
const clients = {};

io.on("connection", (socket) => {
    console.log("connected");
    console.log(socket.id, "has joined");
  
    // Event: User Signin
    socket.on("signin", (id) => {
      console.log(id);
      clients[id] = socket;
      console.log(clients);
    });
  
    // Event: User Message
    socket.on("message", (msg) => {
      console.log("Received message:", msg);
      const targetId = msg.targetId;
  
      if (clients[targetId]) {
        clients[targetId].emit("message", msg);
      } else {
        console.log("Target user not found or not connected");
        socket.emit("error", "Target user not found or not connected");
      }
    });
  
    // Event: Socket Error
    socket.on('error', (error) => {
      console.error('Socket Error:', error);
    });
    
  });


server.listen(port,"0.0.0.0", () => {
    console.log("Server started on port", port);
});