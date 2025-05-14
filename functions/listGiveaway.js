const {
  EmbedBuilder,
  MessageFlags,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require('discord.js');
const Giveaway = require('../models/Giveaway');

async function listGiveaway(interaction) {
  try {
    // Defer the reply immediately to prevent timeout
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const giveaways = await Giveaway.find({
      guildId: interaction.guild.id,
      ongoing: true,
    });

    if (giveaways.length === 0) {
      return interaction.editReply({
        content: 'There are no ongoing giveaways in this server.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const itemsPerPage = 5;
    let currentPage = 0;
    const totalPages = Math.ceil(giveaways.length / itemsPerPage);

    const createEmbed = (page) => {
      const start = page * itemsPerPage;
      const end = Math.min(start + itemsPerPage, giveaways.length);
      const currentGiveaways = giveaways.slice(start, end);

      const embed = new EmbedBuilder()
        .setTitle('🎉 Ongoing Giveaways 🎉')
        .setColor('#FF0000')
        .setDescription(`Page ${page + 1}/${totalPages}`)
        .setTimestamp();

      currentGiveaways.forEach((giveaway, index) => {
        try {
          // Ensure endTime is a valid Date object
          const endTime =
            giveaway.endTime instanceof Date
              ? giveaway.endTime
              : new Date(giveaway.endTime);
          const timeLeft = Math.max(0, endTime.getTime() - Date.now());

          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

          const timeString =
            [
              days > 0 ? `${days}d` : '',
              hours > 0 ? `${hours}h` : '',
              minutes > 0 ? `${minutes}m` : '',
              seconds > 0 ? `${seconds}s` : '',
            ]
              .filter(Boolean)
              .join(' ') || 'Ended';

          const requiredRole = giveaway.requiredRole
            ? `\nRequired Role: <@&${giveaway.requiredRole}>`
            : '';

          embed.addFields({
            name: `Giveaway #${start + index + 1}`,
            value: `Prize: **${giveaway.prize}**\nWinners: **${giveaway.winners}**\nTime Left: **${timeString}**\nParticipants: **${giveaway.participants.length}**${requiredRole}\n[Go to Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`,
            inline: false,
          });
        } catch (error) {
          console.error('Error processing giveaway:', error);
          // Skip this giveaway if there's an error
        }
      });

      return embed;
    };

    const previousButton = new ButtonBuilder()
      .setCustomId('previous_page')
      .setLabel('Previous')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 0);

    const nextButton = new ButtonBuilder()
      .setCustomId('next_page')
      .setLabel('Next')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === totalPages - 1);

    const row = new ActionRowBuilder().addComponents(
      previousButton,
      nextButton
    );

    const message = await interaction.editReply({
      embeds: [createEmbed(currentPage)],
      components: [row],
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on('collect', async (i) => {
      try {
        if (i.customId === 'previous_page') {
          currentPage = Math.max(0, currentPage - 1);
        } else if (i.customId === 'next_page') {
          currentPage = Math.min(totalPages - 1, currentPage + 1);
        }

        previousButton.setDisabled(currentPage === 0);
        nextButton.setDisabled(currentPage === totalPages - 1);

        await i.update({
          embeds: [createEmbed(currentPage)],
          components: [row],
        });
      } catch (error) {
        console.error('Error updating giveaway list:', error);
        if (!i.replied && !i.deferred) {
          await i.reply({
            content:
              'An error occurred while updating the list. Please try again.',
            flags: [MessageFlags.Ephemeral],
          });
        }
      }
    });

    collector.on('end', async () => {
      try {
        await message.edit({
          components: [],
        });
      } catch (error) {
        console.error('Error removing buttons:', error);
      }
    });
  } catch (error) {
    console.error('Error listing giveaways:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content:
          'An error occurred while listing the giveaways. Please try again later.',
        flags: [MessageFlags.Ephemeral],
      });
    } else {
      await interaction.editReply({
        content:
          'An error occurred while listing the giveaways. Please try again later.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }
}

module.exports = listGiveaway;
