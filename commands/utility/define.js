const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('define')
    .setDescription('Get the definition of a word.')
    .addStringOption((option) =>
      option
        .setName('word')
        .setDescription('The word to define')
        .setRequired(true)
    ),

  async execute(interaction) {
    const word = interaction.options.getString('word');

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );

      if (!response.ok) {
        return await interaction.reply(
          'Could not find the definition. Please check the word and try again.'
        );
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        return await interaction.reply('No definition found for that word.');
      }

      const definitions = data[0].meanings[0].definitions;

      const definitionEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Definition of "${word}"`)
        .setDescription(
          definitions
            .map((def, index) => `**${index + 1}.** ${def.definition}`)
            .join('\n')
        )
        .setFooter({ text: 'Powered by Dictionary API' })
        .setTimestamp();

      await interaction.reply({ embeds: [definitionEmbed] });
    } catch (error) {
      console.error('Error fetching definition:', error);
      await interaction.reply(
        'An error occurred while fetching the definition. Please try again later.'
      );
    }
  },
};
