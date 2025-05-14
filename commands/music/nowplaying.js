const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { formatTime, createProgressBar } = require('../../utils/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show information about the currently playing track'),
  async execute(interaction) {
    const client = interaction.client;
    const player = client.lavalink.players.get(interaction.guild.id);

    if (!player || !player.queue.current) {
      return interaction.reply({
        content: '🎵 Nothing is playing right now!',
        ephemeral: true,
      });
    }

    const current = player.queue.current;
    const progress = createProgressBar(player.position, current.info.duration);
    const queueLength = player.queue.tracks.length;

    const embed = new EmbedBuilder()
      .setColor('#B0C4DE')
      .setAuthor({
        name: 'Now Playing 🎵',
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle(current.info.title)
      .setURL(current.info.uri)
      .setDescription(
        `${progress}\n\`${formatTime(player.position)} / ${formatTime(current.info.duration)}\``
      )
      .setThumbnail(current.info.artworkUrl)
      .addFields([
        {
          name: '👤 Artist',
          value: `\`${current.info.author}\``,
          inline: true,
        },
        {
          name: '🎧 Requested by',
          value: current.requester ? `${player.requester}` : 'Unknown',
          inline: true,
        },
        {
          name: '🎶 Up Next',
          value:
            queueLength > 0
              ? `${queueLength} track${queueLength === 1 ? '' : 's'}`
              : 'Nothing queued',
          inline: true,
        },
        {
          name: '🔊 Volume',
          value: `\`${player.volume}%\``,
          inline: true,
        },
        {
          name: '🔄 Loop Mode',
          value: `\`${player.repeatMode.charAt(0).toUpperCase() + player.repeatMode.slice(1)}\``,
          inline: true,
        },
        {
          name: '⏯️ Status',
          value: `\`${player.paused ? 'Paused' : 'Playing'}\``,
          inline: true,
        },
      ])
      .setTimestamp()
      .setFooter({
        text: `Server: ${interaction.guild.name}`,
        iconURL: interaction.guild.iconURL(),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
