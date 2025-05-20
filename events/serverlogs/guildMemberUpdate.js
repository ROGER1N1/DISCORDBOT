const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(oldMember, newMember) {
    if (!oldMember.guild) return;

    const logSettings = await ServerLog.findOne({
      guildId: oldMember.guild.id,
    });
    if (
      !logSettings ||
      !logSettings.logChannel ||
      !logSettings.categories.nicknames
    )
      return;

    const logChannel = oldMember.guild.channels.cache.get(
      logSettings.logChannel
    );
    if (!logChannel) return;

    if (oldMember.nickname !== newMember.nickname) {
      const oldNickname = oldMember.nickname || 'None';
      const newNickname = newMember.nickname || 'None';

      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({
          name: newMember.user.tag,
          iconURL: newMember.user.displayAvatarURL(),
        })
        .setTitle('Nickname Changed')
        .setDescription(
          `**User:** <@${newMember.id}>\n` +
            `**Old Nickname:** ${oldNickname}\n` +
            `**New Nickname:** ${newNickname}`
        )
        .setFooter({ text: `User ID: ${newMember.id}` })
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    }
  },
};
