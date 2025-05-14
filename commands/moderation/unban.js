const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a member from the server.')
    .addStringOption((option) =>
      option
        .setName('user_id')
        .setDescription('The ID of the user to unban')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for unbanning the user')
        .setRequired(false)
    ),

  async execute(interaction) {
    const userId = interaction.options.getString('user_id');
    const reason =
      interaction.options.getString('reason') || 'No reason provided.';
    const executor = interaction.member;

    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({
        content: 'You do not have `BanMembers` permission to ban members!',
        ephemeral: true,
      });
    }

    try {
      await interaction.guild.members.unban(userId, reason);

      const unbanEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('Member Unbanned')
        .setDescription(`✅ \`${userId}\` has been unbanned from the server.`)
        .addFields(
          { name: 'Reason', value: reason, inline: true },
          {
            name: 'Unbanned by',
            value: `<@${interaction.user.id}>`,
            inline: true,
          }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [unbanEmbed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content:
          'Failed to unban the user. Please ensure the user ID is correct and that I have permission to unban members.',
        ephemeral: true,
      });
    }
  },
};
