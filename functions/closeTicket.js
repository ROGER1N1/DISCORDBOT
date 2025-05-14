const { EmbedBuilder } = require('discord.js');
const TranscriptGenerator = require('./transcriptGenerator');
const Ticket = require('../models/Ticket');
const TicketSettings = require('../models/TicketSettings');

/**
 * Closes a ticket channel and handles all related operations
 * @param {Channel} channel - The ticket channel to close
 * @param {User} closer - The user who is closing the ticket
 * @param {String} reason - Optional reason for closing the ticket
 * @returns {Promise<Object>} Result of the operation
 */
async function closeTicket(channel, closer, reason = 'No reason provided') {
  try {
    if (!channel.name.startsWith('ticket-')) {
      throw new Error('This is not a ticket channel');
    }

    const settings = await TicketSettings.findOne({
      guildId: channel.guild.id,
    });
    const ticket = await Ticket.findOne({
      channelId: channel.id,
      status: 'open',
    });

    if (!ticket) {
      throw new Error('No active ticket found for this channel');
    }

    const { transcript, attachments } =
      await TranscriptGenerator.generateTranscript(channel, closer);

    const transcriptEmbed = new EmbedBuilder()
      .setColor('#DDA0DD')
      .setTitle('Ticket Transcript')
      .addFields([
        { name: 'Ticket', value: channel.name, inline: true },
        {
          name: 'Opened By',
          value: `<@${ticket.userId}>`,
          inline: true,
        },
        { name: 'Closed By', value: closer.tag, inline: true },
        { name: 'Reason', value: reason, inline: true },
      ])
      .setTimestamp();

    if (settings?.logChannelId) {
      const logChannel = channel.guild.channels.cache.get(
        settings.logChannelId
      );
      if (logChannel) {
        await logChannel.send({
          embeds: [transcriptEmbed],
          files: [transcript, ...attachments],
        });
      }
    }

    try {
      const ticketCreator = await channel.client.users.fetch(ticket.userId);
      await ticketCreator.send({
        embeds: [transcriptEmbed],
        files: [transcript, ...attachments],
      });
    } catch (err) {
      console.error('Could not DM transcript to user:', err);
    }

    ticket.status = 'closed';
    ticket.closedAt = new Date();
    ticket.closedBy = closer.id;
    ticket.closeReason = reason;
    await ticket.save();

    await channel.send('🔒 Closing ticket in 5 seconds...');

    setTimeout(async () => {
      try {
        await channel.delete();
      } catch (err) {
        console.error('Error deleting channel:', err);
      }
    }, 5000);

    return { success: true, ticket };
  } catch (error) {
    console.error('Error in closeTicket function:', error);
    throw error;
  }
}

module.exports = closeTicket;
