async function autoPlayFunction(player, lastPlayedTrack) {
  if (!player.get('autoplay')) return;
  if (player.get('autoplay') == false) return;
  if (!lastPlayedTrack)
    return console.log("Autoplay doesn't have a lastPlayedTrack to reference.");

  if (
    lastPlayedTrack.info.sourceName === 'youtube' ||
    lastPlayedTrack.info.sourceName === 'youtubemusic'
  ) {
    try {
      const res = await player.search(
        {
          query: `https://www.youtube.com/watch?v=${lastPlayedTrack.info.identifier}&list=RD${lastPlayedTrack.info.identifier}`,
          source: 'youtube',
        },
        lastPlayedTrack.requester
      );

      res.tracks = res.tracks.filter(
        (track) => track.info.identifier !== lastPlayedTrack.info.identifier
      );

      if (res && res.tracks.length) {
        await player.queue.add(
          res.tracks.slice(0, 5).map((track) => {
            track.pluginInfo.clientData = {
              ...(track.pluginInfo.clientData || {}),
              fromAutoplay: true,
            };
            return track;
          })
        );
      }
    } catch (error) {
      console.warn('Error fetching YouTube autoplay track:', error);
    }
    return;
  }
}

module.exports = { autoPlayFunction };
