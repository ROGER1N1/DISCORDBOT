const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomnumber')
    .setDescription('Generates a random number between the specified range.')
    .addIntegerOption((option) =>
      option
        .setName('min')
        .setDescription('Minimum number (inclusive)')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('max')
        .setDescription('Maximum number (inclusive)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const min = interaction.options.getInteger('min');
    const max = interaction.options.getInteger('max');

    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🎲 Random Number Generator')
      .setDescription(
        `You requested a random number between **${min}** and **${max}**.`
      )
      .addFields(
        {
          name: 'Random Number',
          value: `${randomNumber}`,
          inline: true,
        },
        {
          name: 'Requested by',
          value: `${interaction.user.tag}`,
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
