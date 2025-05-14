const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  tracks: [
    {
      title: String,
      uri: String,
      author: String,
      duration: Number,
      artworkUrl: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

playlistSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Playlist', playlistSchema);
