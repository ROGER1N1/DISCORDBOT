const mongoose = require('mongoose');

const guildSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  xpRate: { type: Number, default: 1 },
  levelUpChannelId: { type: String, default: null },
  levelingEnabled: { type: Boolean, default: true },
  startingXp: { type: Number, default: 1000 },
  xpPerLevel: { type: Number, default: 500 },
});

const memberDataSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  totalXp: { type: Number, default: 0 },
});

memberDataSchema.index({ guildId: 1, userId: 1 }, { unique: true });

const levelRoleSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  level: { type: Number, required: true },
  roleId: { type: String, required: true },
});

levelRoleSchema.index({ guildId: 1, level: 1 }, { unique: true });

const GuildSettings = mongoose.model('GuildSettings', guildSettingsSchema);
const MemberData = mongoose.model('MemberData', memberDataSchema);
const LevelRoles = mongoose.model('LevelRoles', levelRoleSchema);

module.exports = {
  GuildSettings,
  MemberData,
  LevelRoles,
};
