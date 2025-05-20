const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(oldMember, newMember) {
    const guildSettings = await ServerLog.findOne({
      guildId: newMember.guild.id,
    });
    if (
      !guildSettings ||
      !guildSettings.categories.boosts ||
      !guildSettings.logChannel
    )
      return;

    const logChannel = newMember.guild.channels.cache.get(
      guildSettings.logChannel
    );
    if (!logChannel) return;

    if (!oldMember.premiumSince && newMember.premiumSince) {
      const embed = new EmbedBuilder()
        .setTitle('Server Boost')
        .setColor('Purple')
        .setDescription(`<@${newMember.id}> has boosted the server!`)
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    } else if (oldMember.premiumSince && !newMember.premiumSince) {
      const embed = new EmbedBuilder()
        .setTitle('Boost Removed')
        .setColor('Red')
        .setDescription(`<@${newMember.id}> has removed their server boost.`)
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    }
  },
};
