const { Events, EmbedBuilder } = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.GuildRoleUpdate,
  once: false,
  async execute(oldRole, newRole) {
    const guildSettings = await ServerLog.findOne({
      guildId: newRole.guild.id,
    });
    if (
      !guildSettings ||
      !guildSettings.categories.roleEvents ||
      !guildSettings.logChannel
    )
      return;

    const logChannel = newRole.guild.channels.cache.get(
      guildSettings.logChannel
    );
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('Role Updated')
      .setColor('Orange')
      .addFields({
        name: 'Role',
        value: `<@&${newRole.id}> (${newRole.id})`,
      });

    let hasChanges = false;

    if (oldRole.name !== newRole.name) {
      embed.addFields({
        name: 'Name Changed',
        value: `**Old:** ${oldRole.name}\n**New:** ${newRole.name}`,
      });
      hasChanges = true;
    }

    if (oldRole.color !== newRole.color) {
      embed.addFields({
        name: 'Color Changed',
        value: `**Old:** ${oldRole.hexColor}\n**New:** ${newRole.hexColor}`,
      });
      hasChanges = true;
    }

    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
      const oldPermissions = oldRole.permissions.toArray().join(', ') || 'None';
      const newPermissions = newRole.permissions.toArray().join(', ') || 'None';
      embed.addFields({
        name: 'Permissions Changed',
        value: `**Old:** ${oldPermissions}\n**New:** ${newPermissions}`,
      });
      hasChanges = true;
    }

    if (hasChanges) {
      embed.setTimestamp();
      logChannel.send({ embeds: [embed] });
    }
  },
};
