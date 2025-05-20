const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.GuildRoleDelete,
  once: false,
  async execute(role) {
    const guildSettings = await ServerLog.findOne({
      guildId: role.guild.id,
    });
    if (
      !guildSettings ||
      !guildSettings.categories.roleEvents ||
      !guildSettings.logChannel
    )
      return;

    const logChannel = role.guild.channels.cache.get(guildSettings.logChannel);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('Role Deleted')
      .setColor('Red')
      .addFields({ name: 'Role Name', value: role.name, inline: true })
      .addFields({ name: 'Role ID', value: role.id, inline: true })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  },
};
