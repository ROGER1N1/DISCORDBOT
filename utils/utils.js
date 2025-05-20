function formatTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function createProgressBar(current, total, size = 15) {
  const progress = Math.round((current / total) * size);
  return '▬'.repeat(progress) + '🔘' + '▬'.repeat(size - progress);
}

module.exports = {
  formatTime,
  createProgressBar,
};
