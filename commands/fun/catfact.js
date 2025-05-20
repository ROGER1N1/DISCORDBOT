const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('catfact')
    .setDescription('Get a random cat fact!'),

  async execute(interaction) {
    try {
      const response = await fetch('https://catfact.ninja/fact');
      const factData = await response.json();

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('Did You Know?')
        .setDescription(factData.fact)
        .setFooter({ text: 'Want another fact? Use /catfact!' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching cat fact:', error);
      await interaction.reply(
        "Sorry, I couldn't fetch a cat fact at the moment. Please try again later."
      );
    }
  },
};
