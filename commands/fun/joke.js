const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Tells a random joke'),

  async execute(interaction) {
    const response = await fetch(
      'https://official-joke-api.appspot.com/random_joke'
    );
    const joke = await response.json();

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🎭 Joke')
      .addFields(
        { name: 'Setup', value: joke.setup, inline: false },
        { name: 'Punchline', value: joke.punchline, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
