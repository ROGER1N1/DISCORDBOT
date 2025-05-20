const { Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  name: Events.GuildDelete,
  async execute(guild) {
    let logChannel;
    try {
      logChannel = guild.client.channels.cache.get(process.env.LOGS_CHANNEL_ID);
    } catch (error) {
      console.error('Could not fetch the log channel:', error);
      return;
    }
    if (!logChannel) return;

    let ownerInfo = 'Unknown';
    try {
      const owner = await guild.fetchOwner();
      ownerInfo = `**<@${owner.id}>** (\`id: ${owner.id}\`)`;
    } catch (error) {
      console.error('Could not fetch owner:', error);
    }

    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle(`${guild.client.user.username} has been removed from a guild`)
      .setDescription(`**${guild.name}**`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        {
          name: 'Created On',
          value: `${new Date(guild.createdTimestamp).toLocaleString()}`,
          inline: false,
        },
        {
          name: 'Removed On',
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
          value: ownerInfo,
          inline: false,
        },
        {
          name: 'Final Members Count',
          value: `\`[ ${guild.memberCount} ]\``,
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
