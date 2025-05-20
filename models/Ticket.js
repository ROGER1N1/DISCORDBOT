const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true },
    ticketId: { type: String, required: true },
    channelId: { type: String, required: true },
    userId: { type: String, required: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TicketCategory',
      required: true,
    },
    categoryName: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    reason: { type: String },
    createdAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    closedBy: { type: String },
    transcriptUrl: { type: String },
    claimedBy: { type: String, default: null },
    claimedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ticketSchema.index({ guildId: 1, userId: 1, status: 1 });
ticketSchema.index({ channelId: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', ticketSchema);
