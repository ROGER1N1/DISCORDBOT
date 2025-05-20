const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { formatTime } = require('../../utils/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Manage the Queue')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('view')
        .setDescription('View list of tracks in the queue')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a song from the queue')
        .addIntegerOption((option) =>
          option
            .setName('song')
            .setDescription('The position of the song you want to remove')
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('clear').setDescription('Clear the whole queue')
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const client = interaction.client;
    const player = client.lavalink.players.get(interaction.guild.id);

    if (!player || !player.queue.current) {
      return interaction.reply({
        content: '❌ Nothing is playing!',
        ephemeral: true,
      });
    }

    if (!player.queue.tracks?.length) {
      return interaction.reply({
        content: '❌ Queue is empty!',
        ephemeral: true,
      });
    }

    switch (subcommand) {
      case 'view': {
        const queueTracks = player.queue.tracks;
        const tracksPerPage = 10;
        const totalPages = Math.ceil(queueTracks.length / tracksPerPage);
        let currentPage = 1;

        const generateEmbed = (page) => {
          const start = (page - 1) * tracksPerPage;
          const end = start + tracksPerPage;
          const currentTrack = player.queue.current;

          const totalDuration = player.queue.tracks.reduce(
            (acc, track) => acc + track.info.duration,
            currentTrack.info.duration
          );

          const queue = queueTracks
            .slice(start, end)
            .map(
              (track, i) =>
                `\`${start + i + 1}.\` [${track.info.title}](${track.info.uri})\n` +
                `┗ ${getSourceEmoji(track.info.sourceName)} \`${track.info.author}\` • ⌛ \`${formatTime(track.info.duration)}\``
            );

          return new EmbedBuilder()
            .setColor('#B0C4DE')
            .setAuthor({
              name: 'Music Queue 🎵',
              iconURL: client.user.displayAvatarURL(),
            })
            .setThumbnail(currentTrack.info.artworkUrl)
            .setDescription(
              `**Now Playing:**\n` +
                `[${currentTrack.info.title}](${currentTrack.info.uri})\n` +
                `┗ ${getSourceEmoji(currentTrack.info.sourceName)} \`${currentTrack.info.author}\` • ⌛ \`${formatTime(currentTrack.info.duration)}\`\n\n` +
                `**Up Next:**\n${queue.join('\n\n')}`
            )
            .addFields([
              {
                name: '🎵 Queue Length',
                value: `\`${queueTracks.length} tracks\``,
                inline: true,
              },
              {
                name: '⌛ Total Duration',
                value: `\`${formatTime(totalDuration)}\``,
                inline: true,
              },
              {
                name: '🔄 Loop Mode',
                value: `\`${player.repeatMode.charAt(0).toUpperCase() + player.repeatMode.slice(1)}\``,
                inline: true,
              },
            ])
            .setFooter({
              text: `Page ${page}/${totalPages} • Use the buttons below to navigate`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();
        };

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('prev')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === 1),
          new ButtonBuilder()
            .setCustomId('next')
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === totalPages)
        );

        const message = await interaction.reply({
          embeds: [generateEmbed(currentPage)],
          components: [row],
          fetchReply: true,
        });

        const collector = message.createMessageComponentCollector({
          filter: (i) => i.user.id === interaction.user.id,
          time: 60000,
        });

        collector.on('collect', async (buttonInteraction) => {
          try {
            if (!buttonInteraction.deferred && !buttonInteraction.replied) {
              await buttonInteraction.deferUpdate();
            }

            if (buttonInteraction.customId === 'prev' && currentPage > 1) {
              currentPage--;
            } else if (
              buttonInteraction.customId === 'next' &&
              currentPage < totalPages
            ) {
              currentPage++;
            }

            const updatedRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('prev')
                .setEmoji('⬅️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 1),
              new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('➡️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === totalPages)
            );

            await buttonInteraction.message.edit({
              embeds: [generateEmbed(currentPage)],
              components: [updatedRow],
            });
          } catch (error) {
            if (error.code !== 40060) {
              console.error('Error handling queue interaction:', error);
            }
          }
        });

        collector.on('end', () => {
          const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('prev')
              .setEmoji('⬅️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('next')
              .setEmoji('➡️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true)
          );

          message.edit({ components: [disabledRow] }).catch(console.error);
        });
        break;
      }

      case 'remove': {
        const removePos = interaction.options.getInteger('song');
        if (player.queue.tracks?.length < removePos) {
          return interaction.reply({
            content: "❌ Cannot remove a track that isn't in the queue!",
            ephemeral: true,
          });
        }

        const removeTrack = player.queue.tracks[removePos - 1];
        await player.queue.remove(removeTrack);

        const removedEmbed = new EmbedBuilder()
          .setColor('#B0C4DE')
          .setAuthor({
            name: 'Removed from Queue 🗑️',
            iconURL: client.user.displayAvatarURL(),
          })
          .setDescription(
            `Removed [${removeTrack.info.title}](${removeTrack.info.uri})`
          )
          .setThumbnail(removeTrack.info.artworkUrl)
          .addFields({
            name: '🎵 Queue Length',
            value: `\`${player.queue.tracks.length} tracks remaining\``,
            inline: true,
          })
          .setFooter({
            text: `Removed by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();

        interaction.reply({ embeds: [removedEmbed] });
        break;
      }

      case 'clear': {
        const queueLength = player.queue.tracks.length;
        player.queue.splice(0, queueLength);

        const clearEmbed = new EmbedBuilder()
          .setColor('#B0C4DE')
          .setAuthor({
            name: 'Queue Cleared 🧹',
            iconURL: client.user.displayAvatarURL(),
          })
          .setDescription(
            `Successfully cleared \`${queueLength}\` tracks from the queue`
          )
          .setFooter({
            text: `Cleared by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();

        interaction.reply({ embeds: [clearEmbed] });
        break;
      }
    }
  },
};

function getSourceEmoji(source = '') {
  const emojis = {
    youtube: '📺',
    'youtube music': '🎵',
    spotify: '💚',
    soundcloud: '🟠',
    deezer: '💿',
  };
  return emojis[source.toLowerCase()] || '🎵';
}
