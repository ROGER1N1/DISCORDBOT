const { EmbedBuilder, MessageFlags } = require('discord.js');
const Giveaway = require('../models/Giveaway');

async function cancelGiveaway(interaction) {
  try {
    const messageId = interaction.options.getString('message_id');
    const giveaway = await Giveaway.findOne({ messageId, ongoing: true });

    if (!giveaway) {
      return interaction.reply({
        content: 'Giveaway not found or has already ended.',
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check if user has permission to manage messages
    const channel = await interaction.guild.channels
      .fetch(giveaway.channelId)
      .catch(() => null);
    if (!channel) {
      return interaction.reply({
        content: 'Could not find the giveaway channel.',
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!channel.permissionsFor(interaction.member).has(['ManageMessages'])) {
      return interaction.reply({
        content: 'You need `ManageMessages` permission to cancel a giveaway!',
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check channel permissions
    if (
      !channel
        .permissionsFor(interaction.guild.members.me)
        .has(['SendMessages', 'EmbedLinks'])
    ) {
      return interaction.reply({
        content:
          'I need `SendMessages` and `EmbedLinks` permissions in the giveaway channel!',
        flags: MessageFlags.Ephemeral,
      });
    }

    // Get the message
    const message = await channel.messages
      .fetch(giveaway.messageId)
      .catch(() => null);
    if (!message) {
      return interaction.reply({
        content: 'Could not find the giveaway message.',
        flags: MessageFlags.Ephemeral,
      });
    }

    // Update the giveaway status
    giveaway.ongoing = false;
    await giveaway.save();

    // Update the message
    let embed = message.embeds[0];
    if (embed) {
      embed = EmbedBuilder.from(embed);
      embed.setTitle('❌ Giveaway Cancelled ❌');
      embed.setDescription(
        `Prize: **${giveaway.prize}**\nStatus: **Cancelled**\nHosted by: ${interaction.user}\nParticipants: ${giveaway.participants.length}`
      );
      embed.setColor('#FF0000');
      await message.edit({ embeds: [embed], components: [] }).catch(() => null);
    }

    await interaction.reply({
      content: 'Giveaway has been cancelled successfully!',
      flags: MessageFlags.Ephemeral,
    });

    // Announce cancellation in the channel
    await channel
      .send(
        `❌ The giveaway for **${giveaway.prize}** has been cancelled by ${interaction.user}.`
      )
      .catch(() => null);
  } catch (error) {
    console.error('Error cancelling giveaway:', error);
    await interaction.reply({
      content:
        'An error occurred while cancelling the giveaway. Please try again later.',
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = cancelGiveaway;
