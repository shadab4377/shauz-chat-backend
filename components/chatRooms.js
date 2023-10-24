// chatRooms.js
const rooms = new Map(); // Map to store room information

function createRoom(roomName) {
  if (!rooms.has(roomName)) {
    // Create a new room if it doesn't exist
    rooms.set(roomName, []);
    return true;
  }
  return false; // Room already exists
}

function joinRoom(roomName, socketId) {
  if (rooms.has(roomName)) {
    const room = rooms.get(roomName);
    room.push(socketId); // Store socket IDs of users in the room
    return true;
  }
  return false; // Room not found
}

module.exports = { createRoom, joinRoom };
