const { EmbedBuilder, MessageFlags } = require('discord.js');
const Giveaway = require('../models/Giveaway');

async function endGiveaway(interaction) {
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
        content: 'You need `ManageMessages` permission to end a giveaway!',
        flags: MessageFlags.Ephemeral,
      });
    }

    // Filter out the host from participants
    const eligibleParticipants = giveaway.participants.filter(
      (participant) => participant !== giveaway.hostId
    );

    if (eligibleParticipants.length < giveaway.winners) {
      return interaction.reply({
        content: 'Not enough participants for the giveaway.',
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

    // Select winners without duplicates and excluding the host
    const winners = [];
    const participants = [...eligibleParticipants]; // Create a copy to avoid modifying the original array

    while (winners.length < giveaway.winners && participants.length > 0) {
      const randomIndex = Math.floor(Math.random() * participants.length);
      winners.push(participants.splice(randomIndex, 1)[0]);
    }

    giveaway.ongoing = false;
    await giveaway.save();

    let embed = message.embeds[0];
    if (!embed) {
      embed = new EmbedBuilder().setTitle('Giveaway Ended').setColor('#00FF00');
    } else {
      embed = EmbedBuilder.from(embed);
    }

    embed.setTitle('🎉 Giveaway Ended 🎉');
    embed.setDescription(
      `Prize: **${giveaway.prize}**\nWinners: ${winners.map((w) => `<@${w}>`).join(', ')}\nHosted by: <@${giveaway.hostId}>\nParticipants: ${eligibleParticipants.length}`
    );
    embed.setColor('#00FF00');

    await message.edit({ embeds: [embed], components: [] }).catch(() => null);
    await channel
      .send(
        `🎉 Congratulations ${winners.map((w) => `<@${w}>`).join(', ')}! You won **${giveaway.prize}**! 🎉`
      )
      .catch(() => null);
    await interaction.reply({
      content: 'Giveaway ended successfully and winners have been announced!',
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error('Error ending giveaway:', error);
    await interaction.reply({
      content:
        'An error occurred while ending the giveaway. Please try again later.',
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = endGiveaway;
