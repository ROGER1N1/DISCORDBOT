const { Events } = require('discord.js');
const WorldWar = require('../models/WorldWar');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    const customId = interaction.customId;
    if (customId.startsWith('worldwar-join-')) {
      const warNumber = parseInt(customId.split('-')[2], 10);
      const userId = interaction.user.id;

      const activeGame = await WorldWar.findOne({
        warNumber,
        status: 'active',
      });

      if (!activeGame) {
        return interaction.reply({
          content: 'No active WorldWar game found.',
          ephemeral: true,
        });
      }

      if (activeGame.participants.includes(userId)) {
        return interaction.reply({
          content: 'You are already in the game.',
          ephemeral: true,
        });
      }

      if (activeGame.participants.length >= activeGame.maxParticipants) {
        return interaction.reply({
          content: 'The game is full.',
          ephemeral: true,
        });
      }

      activeGame.participants.push(userId);
      await activeGame.save();

      interaction.reply({
        content: 'You have successfully joined the WorldWar!',
        ephemeral: true,
      });
    }
  },
};
