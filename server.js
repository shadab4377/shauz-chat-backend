const express = require('express');
const app = express();
const server = app.listen(5000);
const cors = require('cors');
const {v4:uuid} = require('uuid');
const dotenv = require('dotenv');
dotenv.config();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
const http = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  },
});


const { createAuthApi } = require('./components/auth/authApi.js');
const {connectToMongoDB } = require('./components/auth/User.js');

const { createRoom, joinRoom } = require('./components/chatRooms.js');

connectToMongoDB();
createAuthApi(app);

// Map to store user socket associations
const userSocketMap = {};

io.on("connection", (socket) => {
  // console.log(`User Connected: ${socket.id}`);

  socket.on("authenticate", (data) => {
    // Store the socket in the userSocketMap using the username as the key
    userSocketMap[data.username] = socket;
  });

  socket.on("chatRequest", ({ senderUser, recipientUsername, room}) => {
    const recipientSocket = getUserSocketByUsername(recipientUsername);
    if (recipientSocket) {
      recipientSocket.emit("chatRequest", { senderUser,room });
      recipientSocket.join(room);
    }
  });

  socket.on("acceptChatRequest", ({ senderUsername,room }) => {
    const senderSocket = getUserSocketByUsername(senderUsername);
    if (senderSocket) {
      senderSocket.emit("chatRequestAccepted",room);
      senderSocket.join(room);
    }
  });

  socket.on("declineChatRequest", ({ senderUsername }) => {
    const senderSocket = getUserSocketByUsername(senderUsername);
    if (senderSocket) {
      senderSocket.emit("chatRequestDeclined");
    }
  });
  socket.on("chatRequestAccepted", (data) => {
    const senderSocket = userSocketMap[data.senderUsername];
    if (senderSocket) {
      senderSocket.emit("chatRequestAccepted");
    }
  });

  socket.on("chatRequestDeclined", (data) => {
    const senderSocket = userSocketMap[data.senderUsername];
    if (senderSocket) {
      senderSocket.emit("chatRequestDeclined");
    }
  });
  socket.on("join_room", (room) => {
    socket.join(room);
    if (joinRoom(room, socket.id)) {
      
      const messages = roomMessages.get(data.room) || [];
      socket.emit("chat_history", messages);
      console.log(`User with ID: ${socket.id} joined room: ${room}`);
    } else if (createRoom(room)){
      console.log(`User with ID: ${socket.id} created room: ${room}`);
    }
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);

    // Store the message in the room's chat history
    const messages = roomMessages.get(data.room) || [];
    messages.push(data);
    roomMessages.set(data.room, messages);
  });

  socket.on("disconnect", () => {
    const username = getUsernameBySocketId(socket.id);
    if (username) {
      delete userSocketMap[username];
      console.log(`User Disconnected: ${username}`);
    }
  });
});

// Function to retrieve a user's socket by username
function getUserSocketByUsername(username) {
  return userSocketMap[username];
}

// Function to retrieve username by socket ID
function getUsernameBySocketId(socketId) {
  for (const username in userSocketMap) {
    if (userSocketMap[username].id === socketId) {
      return username;
    }
  }
  return null;
}
 