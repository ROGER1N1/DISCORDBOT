const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playerhead')
    .setDescription('Generate a Minecraft player head')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('Minecraft username to fetch player head for')
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');
    const headUrl = `https://mc-heads.net/avatar/${username}/256`;

    const downloadButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Download Player Head')
        .setStyle(ButtonStyle.Link)
        .setURL(headUrl)
    );

    await interaction.reply({
      embeds: [
        {
          title: `👤 Minecraft Player Head`,
          image: { url: headUrl },
          color: 0xff5555,
          description: `Minecraft head for: ${username}`,
        },
      ],
      components: [downloadButton],
    });
  },
};
