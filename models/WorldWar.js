const mongoose = require('mongoose');

const WorldWarSchema = new mongoose.Schema({
  warNumber: { type: Number, required: true },
  participants: { type: Array, default: [] },
  eliminated: { type: Array, default: [] },
  winner: { type: String, default: null },
  status: {
    type: String,
    enum: ['active', 'completed', 'canceled'],
    default: 'active',
  },
  minParticipants: { type: Number, required: true },
  maxParticipants: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
});

module.exports = mongoose.model('WorldWar', WorldWarSchema);
