
const express = require("express");
const fs = require("fs");
const https = require("https");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 4400;

// Read SSL certificate and private key
const privateKey = fs.readFileSync('/etc/letsencrypt/live/job4jobless.in/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/job4jobless.in/fullchain.pem', 'utf8');
const credentials = {
  key: privateKey,
  cert: certificate,
};

// Create an HTTPS server
const server = https.createServer(credentials, app);

// Set up CORS for Express app
app.use(cors());
app.use(express.json());

// Set up CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["https://job4jobless.com", "http://localhost:4200","http://localhost:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["X-Requested-With", "Content-Type"],
    credentials: true
  }
});

// Object to store connected users' socket IDs and their corresponding source IDs
const connectedUsers = {};

io.on('connection', (socket) => {
  console.log('A user has connected:', socket.handshake.query.id);

  // Assign the user's ID (uid or empid) as the socket ID when a user joins
  const userId = socket.handshake.query.id;
  connectedUsers[userId] = socket.id;
  console.log(`User with ID ${userId} has joined`);

socket.on('message', (data) => {
  console.log('Received message data:', data); // Log the entire data object
  const { messageTo, messageFrom, message } = data; // Extract messageTo, messageFrom, and message from data
  console.log('Received message:', message);
  console.log('Source ID:', messageFrom); // Log the source ID (messageFrom)
  console.log('Target ID:', messageTo); // Log the target ID (messageTo)

  const targetSocketId = connectedUsers[data.messageTo];
  if (targetSocketId) {
    // Send the message to the target user if they are connected
    io.to(targetSocketId).emit('message', data);
  } else {
    console.log('Target user not found or not connected');
  }
});

  


  socket.on('disconnect', () => {
    // Remove the user from the list of connected users on disconnect
    delete connectedUsers[userId];
    console.log(`User with ID ${userId} has disconnected`);
  });

  // Event: Socket Error
  socket.on('error', (error) => {
    console.error('Socket Error:', error);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log("Server started on port", port);
});

