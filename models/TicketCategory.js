const mongoose = require('mongoose');

const ticketCategorySchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    emoji: { type: String, required: true },
    supportRoles: [{ type: String }],
    color: { type: String, default: '#DDA0DD' },
  },
  { timestamps: true }
);

ticketCategorySchema.index({ guildId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('TicketCategory', ticketCategorySchema);
