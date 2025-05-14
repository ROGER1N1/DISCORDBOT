module.exports = {
  name: 'trackStuck',
  async execute(client, player, track, thresholdMs) {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) {
      channel.send(
        `⚠️ The track \`${track.info.title}\` got stuck for more than ${thresholdMs}ms. Skipping to the next track.`
      );
    }
    player.skip();
  },
};
