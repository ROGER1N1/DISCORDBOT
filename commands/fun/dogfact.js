const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dogfact')
    .setDescription('Get a random dog fact!'),

  async execute(interaction) {
    try {
      const response = await fetch('https://dog-api.kinduff.com/api/facts');
      const factData = await response.json();
      // json
      // {"facts":[],"success":false}
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('Did You Know?')
        .setDescription(factData.facts[0])
        .setFooter({ text: 'Want another fact? Use /dogfact!' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching dog fact:', error);
      await interaction.reply(
        "Sorry, I couldn't fetch a dog fact at the moment. Please try again later."
      );
    }
  },
};
