const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.ThreadMembersUpdate,
  once: false,
  async execute(oldMembers, newMembers, thread) {
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

    const addedMembers = [...newMembers.keys()].filter(
      (id) => !oldMembers.has(id)
    );
    const removedMembers = [...oldMembers.keys()].filter(
      (id) => !newMembers.has(id)
    );

    const embed = new EmbedBuilder()
      .setTitle('Thread Members Updated')
      .setColor('Purple')
      .addFields(
        { name: 'Thread Name', value: `${thread.name}`, inline: true },
        { name: 'Thread ID', value: `${thread.id}`, inline: true }
      )
      .setTimestamp();

    if (addedMembers.length > 0) {
      embed.addFields({
        name: 'Added Members',
        value: addedMembers.map((id) => `<@${id}>`).join(', ') || 'None',
        inline: false,
      });
    }

    if (removedMembers.length > 0) {
      embed.addFields({
        name: 'Removed Members',
        value: removedMembers.map((id) => `<@${id}>`).join(', ') || 'None',
        inline: false,
      });
    }

    if (addedMembers.length === 0 && removedMembers.length === 0) return;

    logChannel.send({ embeds: [embed] });
  },
};
