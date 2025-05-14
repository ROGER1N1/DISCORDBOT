const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Displays the bot's API and client ping."),

  async execute(interaction) {
    const apiPing = Math.round(interaction.client.ws.ping);
    const sent = await interaction.reply({
      content: 'Pinging...',
      fetchReply: true,
    });
    const clientPing = sent.createdTimestamp - interaction.createdTimestamp;

    const pingEmbed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🏓 Pong!')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields(
        {
          name: '📡 API Ping',
          value: `\`${apiPing}ms\``,
          inline: true,
        },
        {
          name: '⏱️ Client Ping',
          value: `\`${clientPing}ms\``,
          inline: true,
        }
      )
      .setDescription('Here is the latency information for the bot:')
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.editReply({ content: null, embeds: [pingEmbed] });
  },
};
