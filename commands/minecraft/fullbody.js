const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fullbody')
    .setDescription('Generate a Minecraft player full body')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('Minecraft username to fetch player body for')
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');
    const bodyUrl = `https://mc-heads.net/player/${username}/256`;

    const downloadButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Download Player body')
        .setStyle(ButtonStyle.Link)
        .setURL(bodyUrl)
    );

    await interaction.reply({
      embeds: [
        {
          title: `👤 Minecraft Player Full Body`,
          image: { url: bodyUrl },
          color: 0xff5555,
          description: `Minecraft Full Body for: ${username}`,
        },
      ],
      components: [downloadButton],
    });
  },
};
