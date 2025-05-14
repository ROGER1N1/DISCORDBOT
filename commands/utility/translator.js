const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { translate } = require('@vitalets/google-translate-api');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text to a specified language.')
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('The text to translate')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription(
          'The language to translate to (e.g., "es" for Spanish, "fr" for French)'
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    const text = interaction.options.getString('text');
    const targetLanguage = interaction.options.getString('language');

    try {
      const res = await translate(text, { to: targetLanguage });

      const translationEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Translation`)
        .addFields(
          {
            name: 'Original Text',
            value: `\`${text}\``,
            inline: false,
          },
          {
            name: 'Translated Text',
            value: `\`${res.text}\``,
            inline: false,
          },
          {
            name: 'Language',
            value: targetLanguage.toUpperCase(),
            inline: true,
          }
        )
        .setFooter({ text: 'Powered by Google Translate' })
        .setTimestamp();

      const languageButton = new ButtonBuilder()
        .setLabel('Language Codes')
        .setStyle(ButtonStyle.Link)
        .setURL('https://cloud.google.com/translate/docs/languages');

      const row = new ActionRowBuilder().addComponents(languageButton);

      await interaction.reply({
        embeds: [translationEmbed],
        components: [row],
      });
    } catch (error) {
      console.error(error);
      await interaction.reply(
        'An error occurred while trying to translate the text. Please try again.'
      );
    }
  },
};
