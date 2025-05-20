const { GuildSettings } = require('../models/Level');
const { Events } = require('discord.js');

module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    const settings = new GuildSettings({
      guildId: guild.id,
    });

    try {
      await settings.save();
    } catch (error) {
      console.error(
        `Error creating guild settings for ${guild.name}: ${error.message}`
      );
    }
  },
};
