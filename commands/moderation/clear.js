const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears a specified number of messages from the channel.')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Number of messages to delete')
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    if (!interaction.member.permissions.has('ManageMessages')) {
      return interaction.reply({
        content: 'You do not have permission to clear messages.',
        ephemeral: true,
      });
    }
    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: 'Please provide a number between 1 and 100.',
        ephemeral: true,
      });
    }

    await interaction.channel.bulkDelete(amount, true);
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('Messages Cleared')
      .setDescription(`${amount} messages have been deleted.`)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
