const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ServerStatus = require('../../models/ServerStatus');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listserverstatus')
    .setDescription('List all Minecraft servers being tracked.'),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({
        content:
          'You do not have `ManageGuild` permission to view the servers being tracked!',
        ephemeral: true,
      });
    }
    const servers = await ServerStatus.find();

    if (servers.length === 0) {
      return interaction.reply({
        content: 'No server status tracking is currently set up.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('Server Status Tracking')
      .setColor('#00FF00')
      .setDescription('Here are all the Minecraft servers being tracked:');

    servers.forEach((server, index) => {
      embed.addFields({
        name: `${index + 1}. ${server.serverName} (${server.serverIp})`,
        value: `**Game Mode**: ${server.gameMode.toUpperCase()}\n**Channel**: <#${server.channelId}>`,
        inline: false,
      });
    });

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
