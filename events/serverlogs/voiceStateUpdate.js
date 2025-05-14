const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.VoiceStateUpdate,
  once: false,
  async execute(oldState, newState) {
    const guildSettings = await ServerLog.findOne({
      guildId: newState.guild.id,
    });
    if (
      !guildSettings ||
      !guildSettings.categories.voiceEvents ||
      !guildSettings.logChannel
    )
      return;
    const logChannel = newState.guild.channels.cache.get(
      guildSettings.logChannel
    );
    if (!logChannel) return;

    const embed = new EmbedBuilder().setTimestamp();

    if (!oldState.channelId && newState.channelId) {
      embed
        .setTitle('User Joined Voice Channel')
        .setColor('Green')
        .addFields(
          { name: 'User', value: `<@${newState.id}>`, inline: true },
          {
            name: 'Channel',
            value: `${newState.channel.name}`,
            inline: true,
          }
        );
    } else if (oldState.channelId && !newState.channelId) {
      embed
        .setTitle('User Left Voice Channel')
        .setColor('Red')
        .addFields(
          { name: 'User', value: `<@${newState.id}>`, inline: true },
          {
            name: 'Channel',
            value: `${oldState.channel.name}`,
            inline: true,
          }
        );
    } else if (oldState.channelId !== newState.channelId) {
      embed
        .setTitle('User Switched Voice Channels')
        .setColor('Blue')
        .addFields(
          { name: 'User', value: `<@${newState.id}>`, inline: true },
          {
            name: 'Old Channel',
            value: `${oldState.channel.name}`,
            inline: true,
          },
          {
            name: 'New Channel',
            value: `${newState.channel.name}`,
            inline: true,
          }
        );
    }

    if (embed.data.fields) logChannel.send({ embeds: [embed] });
  },
};
