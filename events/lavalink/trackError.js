module.exports = {
  name: 'trackError',
  async execute(client, player, track, error) {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) {
      channel.send(
        `❌ There was an error playing the track: \`${track.info.title}\`. Skipping to the next track.`
      );
    }
    console.error(`Error with track ${track.info.title}:`, error);
  },
};
