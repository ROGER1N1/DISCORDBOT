const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const Giveaway = require('../models/Giveaway');
const ms = require('ms');

async function startGiveaway(interaction) {
  try {
    // Defer the reply immediately to prevent timeout
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const duration = interaction.options.getString('duration');
    const prize = interaction.options.getString('prize');
    const winners = interaction.options.getInteger('winners');
    const requiredRole = interaction.options.getRole('required_role');
    const channel = interaction.options.getChannel('channel');
    const channelId = channel ? channel.id : interaction.channel.id;
    const endTime = Date.now() + ms(duration);
    const durationRegex = /^(?:\d+d)?(?:\d+h)?(?:\d+m)?(?:\d+s)?$/;

    // Validate duration format
    if (!durationRegex.test(duration)) {
      return interaction.editReply({
        content: 'Invalid duration format! Use something like `1d2h30m40s`.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    // Validate minimum duration (30 seconds)
    if (ms(duration) < 30000) {
      return interaction.editReply({
        content: 'Giveaway duration must be at least 30 seconds!',
        flags: [MessageFlags.Ephemeral],
      });
    }

    // Validate maximum duration (30 days)
    if (ms(duration) > 2592000000) {
      return interaction.editReply({
        content: 'Giveaway duration cannot be longer than 30 days!',
        flags: [MessageFlags.Ephemeral],
      });
    }

    // Validate winners count
    if (winners < 1) {
      return interaction.editReply({
        content: 'Number of winners must be at least 1!',
        flags: [MessageFlags.Ephemeral],
      });
    }

    // Validate maximum winners
    if (winners > 50) {
      return interaction.editReply({
        content: 'Number of winners cannot be more than 50!',
        flags: [MessageFlags.Ephemeral],
      });
    }

    // Check channel permissions
    const targetChannel = channel || interaction.channel;
    if (
      !targetChannel
        .permissionsFor(interaction.guild.members.me)
        .has(['SendMessages', 'EmbedLinks', 'AddReactions'])
    ) {
      return interaction.editReply({
        content:
          'I need `SendMessages`, `EmbedLinks`, and `AddReactions` permissions in the target channel!',
        flags: [MessageFlags.Ephemeral],
      });
    }

    // Check if user has permission to manage messages
    if (
      !targetChannel.permissionsFor(interaction.member).has(['ManageMessages'])
    ) {
      return interaction.editReply({
        content: 'You need `ManageMessages` permission to start a giveaway!',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎉 New Giveaway! 🎉')
      .setDescription(
        `Prize: **${prize}**\nHosted by: ${interaction.user}\nEnds in: <t:${Math.floor(endTime / 1000)}:R>\nWinners: **${winners}**`
      )
      .setColor('#FF0000')
      .setTimestamp(endTime);

    if (requiredRole) {
      embed.addFields({
        name: 'Required Role',
        value: `${requiredRole}`,
        inline: true,
      });
    }

    const joinButton = new ButtonBuilder()
      .setCustomId('join_giveaway')
      .setLabel('🎉 Join')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(joinButton);

    const message = await targetChannel.send({
      embeds: [embed],
      components: [row],
    });

    const giveaway = new Giveaway({
      guildId: interaction.guild.id,
      channelId: channelId,
      messageId: message.id,
      prize: prize,
      endTime: new Date(endTime),
      winners: winners,
      participants: [],
      ongoing: true,
      requiredRole: requiredRole ? requiredRole.id : null,
      hostId: interaction.user.id,
    });

    await giveaway.save();

    await interaction.editReply({
      content: `Giveaway started in ${targetChannel}!`,
      flags: [MessageFlags.Ephemeral],
    });
  } catch (error) {
    console.error('Error starting giveaway:', error);
    // Use editReply in the catch block as well
    await interaction.editReply({
      content:
        'An error occurred while starting the giveaway. Please try again later.',
      flags: [MessageFlags.Ephemeral],
    });
  }
}

module.exports = startGiveaway;
