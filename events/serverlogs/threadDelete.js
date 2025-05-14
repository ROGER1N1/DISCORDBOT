const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.ThreadDelete,
  once: false,
  async execute(thread) {
    const guildSettings = await ServerLog.findOne({
      guildId: thread.guild.id,
    });
    if (
      !guildSettings ||
      !guildSettings.categories.threadEvents ||
      !guildSettings.logChannel
    )
      return;

    const logChannel = thread.guild.channels.cache.get(
      guildSettings.logChannel
    );
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('Thread Deleted')
      .setColor('Red')
      .setDescription(`A thread has been deleted from <#${thread.parentId}>`)
      .addFields(
        { name: 'Thread Name', value: `${thread.name}`, inline: true },
        { name: 'Thread ID', value: `${thread.id}`, inline: true }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  },
};
