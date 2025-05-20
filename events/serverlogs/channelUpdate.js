const {
  Events,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
} = require('discord.js');
const ServerLog = require('../../models/serverlogs');

module.exports = {
  name: Events.ChannelUpdate,
  once: false,
  async execute(oldChannel, newChannel) {
    if (!oldChannel.guild) return;

    const logSettings = await ServerLog.findOne({
      guildId: oldChannel.guild.id,
    });
    if (
      !logSettings ||
      !logSettings.logChannel ||
      !logSettings.categories.channelEvents
    )
      return;

    const logChannel = oldChannel.guild.channels.cache.get(
      logSettings.logChannel
    );
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor('Orange')
      .setTitle('Channel Updated')
      .setFooter({ text: `Channel ID: ${newChannel.id}` })
      .setTimestamp();

    let changesDetected = false;

    if (oldChannel.name !== newChannel.name) {
      embed.addFields(
        { name: 'Old Name', value: oldChannel.name, inline: true },
        { name: 'New Name', value: newChannel.name, inline: true }
      );
      changesDetected = true;
    }

    if (
      oldChannel.type === ChannelType.GuildText &&
      oldChannel.topic !== newChannel.topic
    ) {
      embed.addFields(
        {
          name: 'Old Topic',
          value: oldChannel.topic || 'None',
          inline: true,
        },
        {
          name: 'New Topic',
          value: newChannel.topic || 'None',
          inline: true,
        }
      );
      changesDetected = true;
    }

    if (oldChannel.nsfw !== newChannel.nsfw) {
      embed.addFields(
        {
          name: 'Old NSFW Status',
          value: oldChannel.nsfw ? 'Enabled' : 'Disabled',
          inline: true,
        },
        {
          name: 'New NSFW Status',
          value: newChannel.nsfw ? 'Enabled' : 'Disabled',
          inline: true,
        }
      );
      changesDetected = true;
    }

    if (oldChannel.type === ChannelType.GuildVoice) {
      if (oldChannel.bitrate !== newChannel.bitrate) {
        embed.addFields(
          {
            name: 'Old Bitrate',
            value: `${oldChannel.bitrate / 1000} kbps`,
            inline: true,
          },
          {
            name: 'New Bitrate',
            value: `${newChannel.bitrate / 1000} kbps`,
            inline: true,
          }
        );
        changesDetected = true;
      }

      if (oldChannel.userLimit !== newChannel.userLimit) {
        embed.addFields(
          {
            name: 'Old User Limit',
            value: oldChannel.userLimit || 'Unlimited',
            inline: true,
          },
          {
            name: 'New User Limit',
            value: newChannel.userLimit || 'Unlimited',
            inline: true,
          }
        );
        changesDetected = true;
      }
    }

    if (oldChannel.parentId !== newChannel.parentId) {
      const oldCategory = oldChannel.parent ? oldChannel.parent.name : 'None';
      const newCategory = newChannel.parent ? newChannel.parent.name : 'None';
      embed.addFields(
        { name: 'Old Category', value: oldCategory, inline: true },
        { name: 'New Category', value: newCategory, inline: true }
      );
      changesDetected = true;
    }

    const oldPerms = oldChannel.permissionOverwrites.cache;
    const newPerms = newChannel.permissionOverwrites.cache;

    const updatedPerms = newPerms.filter((newPerm) => {
      const oldPerm = oldPerms.get(newPerm.id);
      return (
        !oldPerm ||
        oldPerm.allow.bitfield !== newPerm.allow.bitfield ||
        oldPerm.deny.bitfield !== newPerm.deny.bitfield
      );
    });

    const removedPerms = oldPerms.filter(
      (oldPerm) => !newPerms.has(oldPerm.id)
    );

    if (updatedPerms.size > 0) {
      embed.addFields({
        name: 'Updated Permissions',
        value: updatedPerms
          .map((perm) => {
            const changes = [];
            const oldPerm = oldPerms.get(perm.id);

            if (oldPerm) {
              const addedPerms = new PermissionsBitField(
                perm.allow.bitfield & ~oldPerm.allow.bitfield
              )
                .toArray()
                .join(', ');
              const removedPerms = new PermissionsBitField(
                oldPerm.allow.bitfield & ~perm.allow.bitfield
              )
                .toArray()
                .join(', ');

              if (addedPerms) changes.push(`**Added**: ${addedPerms}`);
              if (removedPerms) changes.push(`**Removed**: ${removedPerms}`);
            } else {
              const allowed = new PermissionsBitField(perm.allow.bitfield)
                .toArray()
                .join(', ');
              if (allowed) changes.push(`**Allowed**: ${allowed}`);
            }

            const denied = new PermissionsBitField(perm.deny.bitfield)
              .toArray()
              .join(', ');
            if (denied) changes.push(`**Denied**: ${denied}`);

            return `<@&${perm.id}>: ${changes.join(' | ')}`;
          })
          .join('\n'),
        inline: false,
      });
      changesDetected = true;
    }

    if (removedPerms.size > 0) {
      embed.addFields({
        name: 'Removed Permissions',
        value: removedPerms
          .map((perm) => `<@${perm.id}>: All permissions removed`)
          .join('\n'),
        inline: false,
      });
      changesDetected = true;
    }

    if (changesDetected) {
      logChannel.send({ embeds: [embed] });
    }
  },
};
