const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievement')
    .setDescription('Generate a Minecraft-style achievement')
    .addStringOption((option) =>
      option
        .setName('icon')
        .setDescription('Select an achievement icon for your Minecraft server.')
        .setRequired(true)
        .addChoices(
          { name: 'Grass', value: '1' },
          { name: 'Diamond', value: '2' },
          { name: 'Diamond Sword', value: '3' },
          { name: 'Creeper', value: '4' },
          { name: 'Pig', value: '5' },
          { name: 'TNT', value: '6' },
          { name: 'Cookie', value: '7' },
          { name: 'Heart', value: '8' },
          { name: 'Bed', value: '9' },
          { name: 'Cake', value: '10' },
          { name: 'Sign', value: '11' },
          { name: 'Rail', value: '12' },
          { name: 'Crafting Table', value: '13' },
          { name: 'Redstone', value: '14' },
          { name: 'Fire', value: '15' },
          { name: 'Cobweb', value: '16' },
          { name: 'Chest', value: '17' },
          { name: 'Furnace', value: '18' },
          { name: 'Book', value: '19' },
          { name: 'Stone', value: '20' },
          { name: 'Wooden Plank', value: '21' },
          { name: 'Iron', value: '22' },
          { name: 'Gold', value: '23' },
          { name: 'Wooden Door', value: '24' },
          { name: 'Iron Door', value: '25' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('head')
        .setDescription('Header for the achievement')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('Body for the achievement')
        .setRequired(true)
    ),

  async execute(interaction) {
    const achievementHead = interaction.options.getString('head');
    const achievementText = interaction.options.getString('text');
    const icon = interaction.options.getString('icon');
    const achievementUrl = `https://minecraftskinstealer.com/achievement/${encodeURIComponent(icon)}/${encodeURIComponent(achievementHead)}/${encodeURIComponent(achievementText)}`;

    const downloadButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Download Achievement')
        .setStyle(ButtonStyle.Link)
        .setURL(achievementUrl)
    );

    await interaction.reply({
      embeds: [
        {
          title: `🏆 Minecraft Achievement`,
          image: { url: achievementUrl },
          color: 0xffaa00,
          description: `Custom achievement unlocked!`,
        },
      ],
      components: [downloadButton],
    });
  },
};
