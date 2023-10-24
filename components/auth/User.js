const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  profilePic: { type: String }, // URL to profile picture
  about: { type: String },
  status: { type: String }
});

const User = mongoose.model('shauz-chat', userSchema,'users');

function connectToMongoDB() {
  mongoose.connect('mongodb://127.0.0.1:27017/shauz-chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to the database');
});
}
module.exports = { User,connectToMongoDB};