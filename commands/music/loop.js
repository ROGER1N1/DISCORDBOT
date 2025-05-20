const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set the loop mode')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('Loop mode')
        .setRequired(true)
        .addChoices(
          { name: 'Off', value: 'off' },
          { name: 'Track', value: 'track' },
          { name: 'Queue', value: 'queue' }
        )
    ),
  async execute(interaction) {
    client = interaction.client;
    const player = client.lavalink.players.get(interaction.guild.id);

    if (!player) {
      return interaction.reply({
        content: 'Nothing is playing!',
        ephemeral: true,
      });
    }

    const mode = interaction.options.getString('mode');
    player.setRepeatMode(mode);

    interaction.reply(`🔄 Loop mode set to: **${mode}**`);
  },
};
