module.exports = {
  name: 'queueEnd',
  async execute(client, player, track) {
    const channel = client.channels.cache.get(player.textChannelId);

    if (channel) {
      channel.send(
        '🔇 The queue has ended. Add more songs to keep the party going!'
      );
    }
    if (player.collector) {
      player.collector.stop();
    }
  },
};
