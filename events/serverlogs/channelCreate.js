const {
  Events,
  EmbedBuilder,
  ChannelType,
  AuditLogEvent,
} = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.ChannelCreate,
  once: false,
  async execute(channel) {
    if (!channel.guild) return;

    const logSettings = await ServerLog.findOne({
      guildId: channel.guild.id,
    });
    if (
      !logSettings ||
      !logSettings.logChannel ||
      !logSettings.categories.channelEvents
    )
      return;

    const logChannel = channel.guild.channels.cache.get(logSettings.logChannel);
    if (!logChannel) return;

    const fetchedLogs = await channel.guild.fetchAuditLogs({
      type: AuditLogEvent.ChannelCreate,
      limit: 1,
    });
    const creationLog = fetchedLogs.entries.first();
    const creator = creationLog ? `<@${creationLog.executor.id}>` : 'Unknown';

    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('Channel Created')
      .addFields(
        { name: 'Name', value: channel.name, inline: true },
        {
          name: 'Type',
          value: `${ChannelType[channel.type] || 'Unknown'}`,
          inline: true,
        },
        { name: 'Created By', value: creator, inline: true }
      )
      .setFooter({ text: `Channel ID: ${channel.id}` })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  },
};
