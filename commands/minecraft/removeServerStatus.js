const { SlashCommandBuilder } = require('discord.js');
const ServerStatus = require('../../models/ServerStatus');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeserverstatus')
    .setDescription('Remove a Minecraft server from tracking.')
    .addStringOption((option) =>
      option
        .setName('servername')
        .setDescription('The name of the server to remove.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('serverip')
        .setDescription('The IP address of the server to remove.')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({
        content:
          'You do not have `ManageGuild` permission to remove server status!',
        ephemeral: true,
      });
    }
    const serverName = interaction.options.getString('servername');
    const serverIp = interaction.options.getString('serverip');

    const server = await ServerStatus.findOneAndDelete({
      serverName,
      serverIp,
    });

    if (!server) {
      return interaction.reply({
        content: `No server found with the name **${serverName}** and IP **${serverIp}**.`,
        ephemeral: true,
      });
    }

    if (server.messageId) {
      try {
        const channel = await interaction.guild.channels.fetch(
          server.channelId
        );
        const message = await channel.messages.fetch(server.messageId);
        await message.delete();
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }

    return interaction.reply({
      content: `Successfully removed server status tracking for **${serverName}** (\`${serverIp}\`).`,
      ephemeral: true,
    });
  },
};
