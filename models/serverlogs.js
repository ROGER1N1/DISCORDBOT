const mongoose = require('mongoose');

const serverLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  logChannel: { type: String, default: null },
  categories: {
    messages: { type: Boolean, default: false },
    nicknames: { type: Boolean, default: false },
    memberEvents: { type: Boolean, default: false },
    channelEvents: { type: Boolean, default: false },
    roleEvents: { type: Boolean, default: false },
    voiceEvents: { type: Boolean, default: false },
    threadEvents: { type: Boolean, default: false },
    boosts: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model('ServerLog', serverLogSchema);
