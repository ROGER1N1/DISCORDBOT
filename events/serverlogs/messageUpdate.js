const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.MessageUpdate,
  once: false,
  async execute(oldMessage, newMessage) {
    if (
      !oldMessage.guild ||
      oldMessage.author?.bot ||
      oldMessage.partial ||
      newMessage.partial
    )
      return;

    const logSettings = await ServerLog.findOne({
      guildId: oldMessage.guild.id,
    });
    if (
      !logSettings ||
      !logSettings.logChannel ||
      !logSettings.categories.messages
    )
      return;

    const logChannel = oldMessage.guild.channels.cache.get(
      logSettings.logChannel
    );
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor('Orange')
      .setAuthor({
        name: oldMessage.author.tag,
        iconURL: oldMessage.author.displayAvatarURL(),
      })
      .setDescription(
        `**Message edited in ${oldMessage.channel}:**\n` +
          `**Before:** ${oldMessage.content || '*No content*'}\n` +
          `**After:** ${newMessage.content || '*No content*'}`
      )
      .setFooter({ text: `User ID: ${oldMessage.author.id}` })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  },
};
