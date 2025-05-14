const Giveaway = require('../models/Giveaway');
const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton() || interaction.customId !== 'join_giveaway')
      return;

    try {
      // Defer the reply immediately to prevent timeout
      await interaction.deferReply({ ephemeral: true });

      const giveaway = await Giveaway.findOne({
        messageId: interaction.message.id,
        ongoing: true,
      });

      if (!giveaway) {
        return interaction.editReply({
          content: 'This giveaway has ended or does not exist.',
          flags: MessageFlags.Ephemeral,
        });
      }

      if (
        giveaway.requiredRole &&
        !interaction.member.roles.cache.has(giveaway.requiredRole)
      ) {
        return interaction.editReply({
          content: `You need the role <@&${giveaway.requiredRole}> to join this giveaway.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      if (!Array.isArray(giveaway.participants)) {
        giveaway.participants = [];
      }

      if (giveaway.participants.includes(interaction.user.id)) {
        return interaction.editReply({
          content: 'You are already participating in this giveaway!',
          flags: MessageFlags.Ephemeral,
        });
      }

      // Add participant and ensure it's a string
      giveaway.participants.push(interaction.user.id.toString());
      await giveaway.save();

      // Update button
      const updatedButton = new ButtonBuilder()
        .setCustomId('join_giveaway')
        .setLabel(`${giveaway.participants.length} 🎉`)
        .setStyle(ButtonStyle.Primary);

      const updatedRow = new ActionRowBuilder().addComponents(updatedButton);

      // Try to update the message
      try {
        await interaction.message.edit({
          components: [updatedRow],
        });
      } catch (error) {
        console.error('Error updating giveaway message:', error);
        // Continue execution even if message update fails
      }

      // Edit the deferred reply
      await interaction.editReply({
        content: 'You have successfully joined the giveaway!',
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error('Error in giveaway button interaction:', error);
      // Only try to reply if we haven't already deferred
      if (!interaction.replied && !interaction.deferred) {
        try {
          await interaction.reply({
            content:
              'An error occurred while processing your request. Please try again later.',
            flags: MessageFlags.Ephemeral,
          });
        } catch (replyError) {
          console.error('Error sending error reply:', replyError);
        }
      }
    }
  },
};
