const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to kick')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for kicking the user')
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

    if (!interaction.member.permissions.has('KickMembers')) {
      return interaction.reply({
        content: 'You do not have `KickMembers` permission to kick members!',
        ephemeral: true,
      });
    }

    if (!member.kickable) {
      return interaction.reply({
        content:
          'I cannot kick this user. They might have a higher role than me or I lack permissions.',
        ephemeral: true,
      });
    }

    if (member.roles.highest.position >= executor.roles.highest.position) {
      return interaction.reply({
        content:
          'You cannot kick this user as they have a higher or equal role.',
        ephemeral: true,
      });
    }
    if (member.roles.highest.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content:
          'I cannot kick this user as they have a higher or equal role than me.',
        ephemeral: true,
      });
    }

    await member.kick(reason);

    const kickEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('Member Kicked')
      .setDescription(`👢 ${user.tag} has been kicked from the server.`)
      .addFields(
        { name: 'Reason', value: reason, inline: true },
        { name: 'Kicked by', value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [kickEmbed] });
  },
};
