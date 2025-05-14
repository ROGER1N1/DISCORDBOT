const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('headavatar')
    .setDescription('Generate a Minecraft player head avatar')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('Minecraft username to fetch player head for')
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
    const headUrl = `https://mc-heads.net/head/${username}/${direction}`;

    const downloadButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Download Player Head Avatar')
        .setStyle(ButtonStyle.Link)
        .setURL(headUrl)
    );

    await interaction.reply({
      embeds: [
        {
          title: `👤 Minecraft Player Head Avatar`,
          image: { url: headUrl },
          color: 0xff5555,
          description: `Minecraft head avatar for: ${username}`,
        },
      ],
      components: [downloadButton],
    });
  },
};
