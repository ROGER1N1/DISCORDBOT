const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bodyavatar')
    .setDescription('Generate a Minecraft player body avatar')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('Minecraft username to fetch player body for')
        .setRequired(true)
    )

    .addStringOption((option) =>
      option
        .setName('direction')
        .setDescription('direction of the avatar')
        .setRequired(false)
        .addChoices(
          { name: 'Left', value: 'left' },
          { name: 'Right', value: 'right' }
        )
    ),

  async execute(interaction) {
    const direction = interaction.options.getString('direction') || null;
    const username = interaction.options.getString('username');
    const bodyUrl = `https://mc-heads.net/body/${username}/${direction}`;

    const downloadButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Download Player body Avatar')
        .setStyle(ButtonStyle.Link)
        .setURL(bodyUrl)
    );

    await interaction.reply({
      embeds: [
        {
          title: `👤 Minecraft Player body Avatar`,
          image: { url: bodyUrl },
          color: 0xff5555,
          description: `Minecraft body avatar for: ${username}`,
        },
      ],
      components: [downloadButton],
    });
  },
};
