const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoplay')
    .setDescription(
      'Toggle autoplay to play recommended tracks when the queue is empty.'
    ),
  async execute(interaction) {
    const client = interaction.client;
    const player = client.lavalink.players.get(interaction.guild.id);

    if (!player.playing) {
      return interaction.reply({
        content: '❌ Nothing is playing!',
        ephemeral: true,
      });
    }

    if (!interaction.member.voice.channel) {
      return interaction.reply({
        content: '❌ You must be in a voice channel!',
        ephemeral: true,
      });
    }

    if (player.voiceChannelId !== interaction.member.voice.channelId) {
      return interaction.reply({
        content: '❌ You must be in the same voice channel as me!',
        ephemeral: true,
      });
    }

    if (
      player.queue.current.info.sourceName !== 'youtube' &&
      player.queue.current.info.sourceName !== 'youtubemusic'
    ) {
      return interaction.reply({
        content: `Autoplay doesn't support the source \`${player.queue.current.info.sourceName}\``,
      });
    }

    const autoplay = player.get('autoplay') || false;
    player.set('autoplay', !autoplay);

    return interaction.reply(
      `✅ **Autoplay is now ${autoplay ? 'disabled' : 'enabled'}!**`
    );
  },
};
