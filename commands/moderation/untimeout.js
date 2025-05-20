const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove the timeout from a member.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to remove timeout from')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for removing the timeout')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason =
      interaction.options.getString('reason') || 'No reason provided.';
    const member = interaction.guild.members.cache.get(user.id);
    const executor = interaction.member;
    const botMember = interaction.guild.members.cache.get(
      interaction.client.user.id
    );

    if (member.roles.highest.position >= executor.roles.highest.position) {
      return interaction.reply({
        content:
          'You cannot untimeout this user as they have a higher or equal role.',
        ephemeral: true,
      });
    }
    if (member.roles.highest.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content:
          'I cannot untimeout this user as they have a higher or equal role than me.',
        ephemeral: true,
      });
    }

    try {
      await member.timeout(null);

      const untimeoutEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('Member Timeout Removed')
        .setDescription(`✅ User ${user.tag} has been removed from timeout.`)
        .addFields(
          { name: 'Reason', value: reason, inline: true },
          {
            name: 'Timeout removed by',
            value: interaction.user.tag,
            inline: true,
          }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [untimeoutEmbed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content:
          'Failed to remove the timeout from the user. Please ensure I have permission to manage timeouts.',
        ephemeral: true,
      });
    }
  },
};
