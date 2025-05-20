const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const Playlist = require('../../models/Playlist');
const { formatTime } = require('../../utils/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Manage your playlists')
    .addSubcommand((sub) =>
      sub
        .setName('create')
        .setDescription('Create a new playlist')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Name of the playlist')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('load')
        .setDescription('Load a playlist into the queue')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Name of the playlist')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('addcurrent')
        .setDescription('Add current track to a playlist')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Name of the playlist')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('addqueue')
        .setDescription('Add all tracks from current queue to a playlist')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Name of the playlist')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add a track or playlist to your playlist')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Name of your playlist')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption((opt) =>
          opt
            .setName('query')
            .setDescription('Track URL or search query')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove a track from your playlist')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Name of the playlist')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addIntegerOption((opt) =>
          opt
            .setName('position')
            .setDescription('Position of the track to remove')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('view')
        .setDescription('View tracks in a playlist')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Name of the playlist')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName('list').setDescription('List all your playlists')
    )
    .addSubcommand((sub) =>
      sub
        .setName('delete')
        .setDescription('Delete a playlist')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Name of the playlist')
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused(true);
    const subcommand = interaction.options.getSubcommand();

    if (focused.name === 'name') {
      const playlists = await Playlist.find({
        userId: interaction.user.id,
      });
      return await interaction.respond(
        playlists
          .filter((p) =>
            p.name.toLowerCase().includes(focused.value.toLowerCase())
          )
          .map((p) => ({
            name: `${p.name} (${p.tracks.length} tracks)`,
            value: p.name,
          }))
      );
    }

    if (subcommand === 'add' && focused.name === 'query') {
      if (!focused.value.trim()) {
        return await interaction.respond([
          {
            name: 'Start typing to search for songs...',
            value: 'start_typing',
          },
        ]);
      }

      const player = interaction.client.lavalink.createPlayer({
        guildId: interaction.guildId,
        textChannelId: interaction.channelId,
      });

      try {
        const results = await player.search({
          query: focused.value,
          source: 'spsearch',
        });

        if (!results?.tracks?.length) {
          return await interaction.respond([
            {
              name: 'No results found',
              value: 'no_results',
            },
          ]);
        }

        let options = [];
        if (results.loadType === 'playlist') {
          options = [
            {
              name: `📑 Playlist: ${results.playlist?.title || 'Unknown'} (${results.tracks.length} tracks)`,
              value: focused.value,
            },
          ];
        } else {
          options = results.tracks.slice(0, 25).map((track) => ({
            name: `${track.info.title} - ${track.info.author}`,
            value: track.info.uri,
          }));
        }

        return await interaction.respond(options);
      } catch (error) {
        return await interaction.respond([
          {
            name: 'Error searching tracks',
            value: 'error',
          },
        ]);
      }
    }
  },

  async execute(interaction) {
    await interaction.deferReply();
    const subcommand = interaction.options.getSubcommand();

    try {
      switch (subcommand) {
        case 'create': {
          const name = interaction.options.getString('name');
          const playlist = await Playlist.create({
            userId: interaction.user.id,
            name,
            tracks: [],
          });

          const embed = new EmbedBuilder()
            .setColor('#F0E68C')
            .setTitle('🎵 Playlist Created')
            .setDescription(`Successfully created playlist: **${name}**`)
            .addFields({
              name: '📑 Tracks',
              value: '`0 tracks`',
              inline: true,
            })
            .setFooter({
              text: `Created by ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

          return await interaction.editReply({ embeds: [embed] });
        }

        case 'load': {
          const name = interaction.options.getString('name');
          const playlist = await Playlist.findOne({
            userId: interaction.user.id,
            name,
          });

          if (!playlist) {
            return await interaction.editReply('❌ Playlist not found!');
          }

          if (!interaction.member.voice.channel) {
            return await interaction.editReply(
              '❌ You need to join a voice channel first!'
            );
          }

          let player = interaction.client.lavalink.players.get(
            interaction.guild.id
          );
          if (!player) {
            player = interaction.client.lavalink.createPlayer({
              guildId: interaction.guild.id,
              voiceChannelId: interaction.member.voice.channel.id,
              textChannelId: interaction.channel.id,
              selfDeaf: true,
            });
            await player.connect();
          }

          const loadEmbed = new EmbedBuilder()
            .setColor('#F0E68C')
            .setTitle('🎵 Loading Playlist')
            .setDescription(
              `Loading **${playlist.tracks.length}** tracks from playlist: **${name}**`
            )
            .addFields([
              {
                name: '📑 Playlist',
                value: `\`${name}\``,
                inline: true,
              },
              {
                name: '⌛ Total Duration',
                value: `\`${formatTime(playlist.tracks.reduce((acc, track) => acc + track.duration, 0))}\``,
                inline: true,
              },
            ])
            .setFooter({
              text: `Loaded by ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

          await interaction.editReply({ embeds: [loadEmbed] });

          for (const track of playlist.tracks) {
            const result = await player.search({
              query: track.uri,
              source: 'spsearch',
            });

            if (result?.tracks?.[0]) {
              result.tracks[0].userData = {
                requester: interaction.member,
              };
              await player.queue.add(result.tracks[0]);
            }
          }

          if (!player.playing) await player.play();

          return await interaction.editReply(
            `✅ Loaded ${playlist.tracks.length} tracks from playlist: ${name}`
          );
        }

        case 'addcurrent': {
          const name = interaction.options.getString('name');
          const player = interaction.client.lavalink.players.get(
            interaction.guild.id
          );

          if (!player?.queue?.current) {
            return await interaction.editReply(
              '❌ Nothing is playing right now!'
            );
          }

          const playlist = await Playlist.findOne({
            userId: interaction.user.id,
            name,
          });

          if (!playlist) {
            return await interaction.editReply('❌ Playlist not found!');
          }

          const track = player.queue.current;
          playlist.tracks.push({
            title: track.info.title,
            uri: track.info.uri,
            author: track.info.author,
            duration: track.info.duration,
            artworkUrl: track.info.artworkUrl,
          });
          await playlist.save();

          const embed = new EmbedBuilder()
            .setColor('#F0E68C')
            .setTitle('🎵 Track Added to Playlist')
            .setDescription(`Added track to playlist: **${name}**`)
            .setThumbnail(track.info.artworkUrl)
            .addFields([
              {
                name: '🎵 Track',
                value: `[${track.info.title}](${track.info.uri})`,
                inline: true,
              },
              {
                name: '👤 Artist',
                value: `\`${track.info.author}\``,
                inline: true,
              },
              {
                name: '⌛ Duration',
                value: `\`${formatTime(track.info.duration)}\``,
                inline: true,
              },
              {
                name: '📑 Playlist Tracks',
                value: `\`${playlist.tracks.length} tracks\``,
                inline: true,
              },
            ])
            .setFooter({
              text: `Added by ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

          return await interaction.editReply({ embeds: [embed] });
        }

        case 'addqueue': {
          const name = interaction.options.getString('name');
          const player = interaction.client.lavalink.players.get(
            interaction.guild.id
          );

          if (!player?.queue?.current) {
            return await interaction.editReply(
              '❌ Nothing is playing right now!'
            );
          }

          const playlist = await Playlist.findOne({
            userId: interaction.user.id,
            name,
          });

          if (!playlist) {
            return await interaction.editReply('❌ Playlist not found!');
          }

          playlist.tracks.push({
            title: player.queue.current.info.title,
            uri: player.queue.current.info.uri,
            author: player.queue.current.info.author,
            duration: player.queue.current.info.duration,
            artworkUrl: player.queue.current.info.artworkUrl,
          });

          for (const track of player.queue.tracks) {
            playlist.tracks.push({
              title: track.info.title,
              uri: track.info.uri,
              author: track.info.author,
              duration: track.info.duration,
              artworkUrl: track.info.artworkUrl,
            });
          }

          await playlist.save();

          const embed = new EmbedBuilder()
            .setColor('#F0E68C')
            .setTitle('🎵 Queue Added to Playlist')
            .setDescription(
              `Added **${player.queue.tracks.length + 1}** tracks to playlist: **${name}**`
            )
            .addFields([
              {
                name: '📑 Added Tracks',
                value: `\`${player.queue.tracks.length + 1} tracks\``,
                inline: true,
              },
              {
                name: '📝 Total Tracks',
                value: `\`${playlist.tracks.length} tracks\``,
                inline: true,
              },
              {
                name: '⌛ Total Duration',
                value: `\`${formatTime(playlist.tracks.reduce((acc, track) => acc + track.duration, 0))}\``,
                inline: true,
              },
            ])
            .setFooter({
              text: `Added by ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

          return await interaction.editReply({ embeds: [embed] });
        }

        case 'add': {
          const name = interaction.options.getString('name');
          const query = interaction.options.getString('query');

          const playlist = await Playlist.findOne({
            userId: interaction.user.id,
            name,
          });

          if (!playlist) {
            return await interaction.editReply('❌ Playlist not found!');
          }

          const player = interaction.client.lavalink.createPlayer({
            guildId: interaction.guild.id,
            textChannelId: interaction.channel.id,
          });

          const results = await player.search({
            query,
            source: 'spsearch',
          });

          if (!results?.tracks?.length) {
            return await interaction.editReply('❌ No tracks found!');
          }

          if (results.loadType === 'playlist') {
            for (const track of results.tracks) {
              playlist.tracks.push({
                title: track.info.title,
                uri: track.info.uri,
                author: track.info.author,
                duration: track.info.duration,
                artworkUrl: track.info.artworkUrl,
              });
            }
            await playlist.save();
            return await interaction.editReply(
              `✅ Added ${results.tracks.length} tracks from playlist to: ${name}`
            );
          } else {
            const track = results.tracks[0];
            playlist.tracks.push({
              title: track.info.title,
              uri: track.info.uri,
              author: track.info.author,
              duration: track.info.duration,
              artworkUrl: track.info.artworkUrl,
            });
            await playlist.save();
            return await interaction.editReply(
              `✅ Added "${track.info.title}" to playlist: ${name}`
            );
          }
        }

        case 'remove': {
          const name = interaction.options.getString('name');
          const position = interaction.options.getInteger('position') - 1;

          const playlist = await Playlist.findOne({
            userId: interaction.user.id,
            name,
          });

          if (!playlist) {
            return await interaction.editReply('❌ Playlist not found!');
          }

          if (position < 0 || position >= playlist.tracks.length) {
            return await interaction.editReply('❌ Invalid track position!');
          }

          const removedTrack = playlist.tracks.splice(position, 1)[0];
          await playlist.save();

          const embed = new EmbedBuilder()
            .setColor('#F0E68C')
            .setTitle('🎵 Track Removed from Playlist')
            .setDescription(`Removed track from playlist: **${name}**`)
            .addFields([
              {
                name: '🎵 Removed Track',
                value: `[${removedTrack.title}](${removedTrack.uri})`,
                inline: false,
              },
              {
                name: '📑 Remaining Tracks',
                value: `\`${playlist.tracks.length} tracks\``,
                inline: true,
              },
              {
                name: '⌛ Track Duration',
                value: `\`${formatTime(removedTrack.duration)}\``,
                inline: true,
              },
            ])
            .setFooter({
              text: `Removed by ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

          return await interaction.editReply({ embeds: [embed] });
        }

        case 'view': {
          const name = interaction.options.getString('name');
          const playlist = await Playlist.findOne({
            userId: interaction.user.id,
            name,
          });

          if (!playlist) {
            return await interaction.editReply('❌ Playlist not found!');
          }

          const tracksPerPage = 10;
          const totalPages = Math.ceil(playlist.tracks.length / tracksPerPage);
          let currentPage = 1;

          const generateEmbed = (page) => {
            const start = (page - 1) * tracksPerPage;
            const end = start + tracksPerPage;
            const tracks = playlist.tracks.slice(start, end);

            const totalDuration = playlist.tracks.reduce(
              (acc, track) => acc + track.duration,
              0
            );

            const embed = new EmbedBuilder()
              .setColor('#F0E68C')
              .setTitle(`🎵 Playlist: ${playlist.name}`)
              .setDescription(
                tracks.length
                  ? tracks
                      .map(
                        (track, i) =>
                          `\`${start + i + 1}.\` [${track.title}](${track.uri})\n` +
                          `┗ 👤 \`${track.author}\` • ⌛ \`${formatTime(track.duration)}\``
                      )
                      .join('\n\n')
                  : 'No tracks in this playlist'
              )
              .addFields([
                {
                  name: '📑 Total Tracks',
                  value: `\`${playlist.tracks.length} tracks\``,
                  inline: true,
                },
                {
                  name: '⌛ Total Duration',
                  value: `\`${formatTime(totalDuration)}\``,
                  inline: true,
                },
              ])
              .setFooter({
                text: `Page ${page}/${totalPages} • Use the buttons below to navigate`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setTimestamp();

            return embed;
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

          const message = await interaction.editReply({
            embeds: [generateEmbed(currentPage)],
            components: totalPages > 1 ? [row] : [],
          });

          if (totalPages > 1) {
            const collector = message.createMessageComponentCollector({
              filter: (i) => i.user.id === interaction.user.id,
              time: 60000,
            });

            collector.on('collect', async (buttonInteraction) => {
              try {
                if (!buttonInteraction.deferred) {
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
                console.error(
                  'Error handling playlist view interaction:',
                  error
                );
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
          }
          break;
        }

        case 'list': {
          const playlists = await Playlist.find({
            userId: interaction.user.id,
          });

          if (!playlists.length) {
            return await interaction.editReply('❌ You have no playlists!');
          }

          const embed = new EmbedBuilder()
            .setColor('#F0E68C')
            .setTitle('📑 Your Playlists')
            .setDescription(
              playlists
                .map((p) => `**${p.name}** - ${p.tracks.length} tracks`)
                .join('\n')
            )
            .setTimestamp();

          return await interaction.editReply({ embeds: [embed] });
        }

        case 'delete': {
          const name = interaction.options.getString('name');
          const playlist = await Playlist.findOneAndDelete({
            userId: interaction.user.id,
            name,
          });

          if (!playlist) {
            return await interaction.editReply('❌ Playlist not found!');
          }

          const embed = new EmbedBuilder()
            .setColor('#F0E68C')
            .setTitle('🎵 Playlist Deleted')
            .setDescription(`Successfully deleted playlist: **${name}**`)
            .addFields([
              {
                name: '📑 Deleted Tracks',
                value: `\`${playlist.tracks.length} tracks\``,
                inline: true,
              },
              {
                name: '⌛ Total Duration',
                value: `\`${formatTime(playlist.tracks.reduce((acc, track) => acc + track.duration, 0))}\``,
                inline: true,
              },
            ])
            .setFooter({
              text: `Deleted by ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

          return await interaction.editReply({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Playlist command error:', error);
      return await interaction.editReply(
        '❌ An error occurred while processing the command.'
      );
    }
  },
};
