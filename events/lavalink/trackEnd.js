module.exports = {
  name: 'trackEnd',
  async execute(client, player, track) {
    const channel = client.channels.cache.get(player.textChannelId);
    if (player.collector) {
      player.collector.stop();
    }
  },
};
