const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dadjoke')
    .setDescription('Get a random dad joke!'),

  async execute(interaction) {
    try {
      const response = await fetch('https://icanhazdadjoke.com/', {
        headers: {
          Accept: 'application/json',
        },
      });
      const jokeData = await response.json();

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("Here's a Dad Joke for You!")
        .setDescription(jokeData.joke)
        .setFooter({ text: 'Want to hear another one? Use /dadjoke!' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching dad joke:', error);
      await interaction.reply(
        "Sorry, I couldn't fetch a dad joke at the moment. Please try again later."
      );
    }
  },
};
