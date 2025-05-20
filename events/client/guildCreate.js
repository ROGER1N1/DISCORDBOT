const { Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    let logChannel;
    try {
      logChannel = await guild.client.channels.fetch(
        process.env.LOGS_CHANNEL_ID
      );
    } catch (error) {
      console.error('Could not fetch the log channel:', error);
      return;
    }
    if (!logChannel) return;

    const owner = await guild.fetchOwner();
    let inviteUrl = 'No invite found';

    try {
      const invites = await guild.invites.fetch();
      const earliestInvite = invites
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .first();
      if (earliestInvite) {
        inviteUrl = earliestInvite.url;
      }
    } catch (error) {
      console.error('Could not fetch invites:', error);
    }

    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle(`${guild.client.user.username} has been added to a guild`)
      .setDescription(`**${guild.name}**`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        {
          name: 'Created On',
          value: `${new Date(guild.createdTimestamp).toLocaleString()}`,
          inline: false,
        },
        {
          name: 'Added On',
          value: `${new Date().toLocaleString()}`,
          inline: false,
        },
        {
          name: 'Guild Id',
          value: `\`${guild.id}\``,
          inline: false,
        },
        {
          name: 'Owner',
          value: `**<@${owner.id}>** (\`id: ${owner.id}\`)`,
          inline: false,
        },
        {
          name: 'Total Members Count',
          value: `\`[ ${guild.memberCount} ]\``,
          inline: false,
        },
        {
          name: 'Invite',
          value: inviteUrl,
          inline: false,
        }
      )
      .setTimestamp();

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Could not send message to the log channel:', error);
    }
  },
};
