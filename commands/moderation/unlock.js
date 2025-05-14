const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlocks the channel to allow messages to be sent.'),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageChannels
      )
    ) {
      return interaction.reply({
        content: 'You do not have permission to lock this channel.',
        ephemeral: true,
      });
    }

    const channel = interaction.channel;

    if (
      !channel
        .permissionsFor(channel.guild.roles.everyone)
        .has(PermissionsBitField.Flags.SendMessages)
    ) {
      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('Channel Unlocked')
        .setDescription(
          `The channel ${channel.name} has been unlocked. Everyone is allowed to send messages`
        )
        .setTimestamp();

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        SendMessages: true,
      });

      try {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        console.error('Error sending lock confirmation:', error);
      }
    } else {
      await interaction.reply({
        content: 'This channel is already unlocked.',
        ephemeral: true,
      });
    }
  },
};
