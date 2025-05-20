const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flips a coin and shows the result.'),

  async execute(interaction) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🪙 Coin Flip')
      .setDescription(`You flipped a coin!`)
      .addFields(
        { name: 'Result', value: result, inline: true },
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
