const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('controls')
    .setDescription('Basic playback controls')
    .addSubcommand((subcommand) =>
      subcommand.setName('join').setDescription('Join the VC')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('pause').setDescription('Pause the current track')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('resume').setDescription('Resume playback')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('skip').setDescription('Skip to the next track')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('stop')
        .setDescription('Stop playback and clear the queue')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('leave').setDescription('Leave the voice channel')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('shuffle').setDescription('Randomize the Queue Order')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('seek')
        .setDescription('Go to the desired position of the song')
        .addStringOption((option) =>
          option.setName('time').setDescription('Time you want to seek to')
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('volume')
        .setDescription('Changes the volume of the player')
        .addIntegerOption((option) =>
          option
            .setName('set')
            .setDescription('Volume')
            .setRequired(true)
            .setMaxValue(100)
            .setMinValue(0)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('skipto')
        .setDescription('Skips to the specific song in the queue')
        .addIntegerOption((option) =>
          option
            .setName('position')
            .setDescription('The position you want to skip to')
            .setRequired(true)
            .setMinValue(1)
        )
    ),
  async execute(interaction) {
    client = interaction.client;
    const player = client.lavalink.players.get(interaction.guild.id);
    const subcommand = interaction.options.getSubcommand();
    if (subcommand != 'join') {
      if (!player) {
        return interaction.reply({
          content: 'Nothing is playing!',
          ephemeral: true,
        });
      }
    }

    switch (subcommand) {
      case 'join':
        if (!player) {
          client.lavalink
            .createPlayer({
              guildId: interaction.guild.id,
              voiceChannelId: interaction.member.voice.channel.id,
              textChannelId: interaction.channel.id,
              selfDeaf: true,
            })
            .connect();
          return interaction.reply(
            `🎵 Joined <#${interaction.member.voice.channel.id}>`
          );
        } else {
          return interaction.reply(
            `I'm already in the VC <#${player.voiceChannelId}>`
          );
        }
        break;

      case 'pause':
        await player.pause();
        interaction.reply('⏸️ Paused');
        break;
      case 'resume':
        await player.resume();
        interaction.reply('▶️ Resumed');
        break;
      case 'skip':
        if (!player.queue.tracks?.length) {
          return interaction.reply({
            content: 'Queue is empty!',
            ephemeral: true,
          });
        }
        await player.skip();
        interaction.reply('⏭️ Skipped');
        break;
      case 'skipto':
        skipPos = interaction.options.getInteger('position');
        if (!player.queue.tracks?.length) {
          return interaction.reply({
            content: 'Queue is empty!',
            ephemeral: true,
          });
        }
        if (player.queue.tracks?.length < skipPos) {
          return interaction.reply({
            content: "Can't skip more than the Queue size",
            ephemeral: true,
          });
        }
        await player.skip(skipPos);
        interaction.reply(`⏭️ Skipped to \`${skipPos}\``);
        break;
      case 'stop':
        await player.stopPlaying();
        interaction.reply('⏹️ Stopped');
        break;
      case 'leave':
        await player.destroy();
        interaction.reply('👋 Left the voice channel');
        break;
      case 'shuffle':
        if (!player.queue.tracks?.length) {
          return interaction.reply({
            content: 'Queue is empty!',
            ephemeral: true,
          });
        }
        player.queue.shuffle();
        interaction.reply('🔀 Queue shuffled');
        break;
      case 'volume':
        const vol = interaction.options.getInteger('set');
        player.setVolume(vol);
        interaction.reply(`🔊 Volume set to \`${vol}\``);
        break;
      case 'seek':
        const timeInput = interaction.options.getString('time').trim();
        const timeParts = timeInput.split(':').map(Number);

        let seekTime = 0;
        if (timeParts.length === 1) {
          seekTime = timeParts[0];
        } else if (timeParts.length === 2) {
          seekTime = timeParts[0] * 60 + timeParts[1];
        } else if (timeParts.length === 3) {
          seekTime = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
        } else {
          return interaction.editReply(
            '❌ Invalid time format. Use `hh:mm:ss`, `mm:ss`, or `ss`.'
          );
        }

        seekTime *= 1000;

        const trackDuration = player.queue.current.duration;
        if (seekTime < 0 || seekTime > trackDuration) {
          return interaction.editReply(
            `❌ Seek time is out of range. The track duration is **${formatDuration(trackDuration)}**.`
          );
        }

        await player.seek(seekTime);
        return interaction.reply(
          `⏩ **Seeked to:** \`${formatDuration(seekTime)}\``
        );
    }
  },
};

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else {
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
