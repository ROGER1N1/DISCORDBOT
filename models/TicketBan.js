const mongoose = require('mongoose');

const ticketBanSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    reason: { type: String, default: 'No reason provided' },
    moderatorId: { type: String, required: true },
    bannedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ticketBanSchema.index({ guildId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('TicketBan', ticketBanSchema);
