const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Locks the channel to prevent messages from being sent.'),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageChannels
      )
    ) {
      return interaction.reply({
        content:
          'You do not have `ManageChannels` permission to lock this channel.',
        ephemeral: true,
      });
    }

    const channel = interaction.channel;

    if (
      channel
        .permissionsFor(channel.guild.roles.everyone)
        .has(PermissionsBitField.Flags.SendMessages)
    ) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Channel Locked')
        .setDescription(
          `The channel ${channel.name} has been locked. Only users with the appropriate role can send messages.`
        )
        .setTimestamp();

      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        SendMessages: false,
      });

      try {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        console.error('Error sending lock confirmation:', error);
      }
    } else {
      await interaction.reply({
        content: 'This channel is already locked.',
        ephemeral: true,
      });
    }
  },
};
