const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'embed_builder') return;

    try {
      const title = interaction.fields.getTextInputValue('embed_title');
      const description =
        interaction.fields.getTextInputValue('embed_description');
      const color = interaction.fields.getTextInputValue('embed_color');
      const authorInput = interaction.fields.getTextInputValue('embed_author');
      const fieldsInput = interaction.fields.getTextInputValue('embed_fields');

      const embed = new EmbedBuilder()
        .setDescription(description)
        .setTimestamp();

      if (title) embed.setTitle(title);
      if (color) embed.setColor(color);

      if (authorInput) {
        const [authorName, authorUrl, authorIconUrl] = authorInput.split('|');
        embed.setAuthor({
          name: authorName,
          url: authorUrl || null,
          iconURL: authorIconUrl || null,
        });
      }

      if (fieldsInput && fieldsInput.trim()) {
        const fields = fieldsInput.split('\n').map((field) => {
          const [name, value, inline] = field.split('|');
          return {
            name: name || '\u200b',
            value: value || '\u200b',
            inline: inline === 'true',
          };
        });
        embed.addFields(fields);
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error creating embed:', error);
      await interaction.reply({
        content: 'Error creating embed. Check your inputs and try again.',
        ephemeral: true,
      });
    }
  },
};
