const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skin')
    .setDescription("Fetch a Minecraft player's skin")
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('Minecraft username to fetch skin for')
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');
    const skinUrl = `https://mc-heads.net/skin/${username}`;

    const downloadButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Download Skin')
        .setStyle(ButtonStyle.Link)
        .setURL(skinUrl)
    );

    await interaction.reply({
      embeds: [
        {
          title: `🤖 Minecraft Skin for ${username}`,
          image: { url: skinUrl },
          color: 0x55ff55,
          description: `Here's the skin for Minecraft player: ${username}`,
        },
      ],
      components: [downloadButton],
    });
  },
};
