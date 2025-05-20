const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const activeGames = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guessnumber')
    .setDescription('Start a guessing game in a specific channel.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('start')
        .setDescription('Start a new guessing game.')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('The channel where the game will be hosted.')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('number')
            .setDescription('The number to guess.')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('stop')
        .setDescription('Stop an ongoing guessing game.')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('The channel where the game is running.')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageServer')) {
      return interaction.reply({
        content:
          'You do not have `ManageServer` permission to manage guess the number game!',
        ephemeral: true,
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('channel');

    if (subcommand === 'start') {
      const number = interaction.options.getInteger('number');

      if (activeGames.has(channel.id)) {
        return interaction.reply({
          content: `There is already an active game in ${channel}!`,
          ephemeral: true,
        });
      }

      activeGames.set(channel.id, { number, guesses: [] });

      try {
        await channel.permissionOverwrites.edit(
          interaction.guild.roles.everyone,
          {
            SendMessages: false,
          }
        );
      } catch (error) {
        console.error('Failed to lock the channel:', error);
      }

      const startEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Guess the Number Game')
        .setDescription(
          `A new game has started in ${channel}!\n The number is \`${number}\``
        )
        .setFooter({ text: `Started by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.reply({ embeds: [startEmbed] });
      return channel.send('The game has started! Start guessing the number!');
    }

    if (subcommand === 'stop') {
      if (!activeGames.has(channel.id)) {
        return interaction.reply({
          content: `There is no active game in ${channel}.`,
          ephemeral: true,
        });
      }

      activeGames.delete(channel.id);

      try {
        await channel.permissionOverwrites.edit(
          interaction.guild.roles.everyone,
          {
            SendMessages: true,
          }
        );
      } catch (error) {
        console.error('Failed to unlock the channel:', error);
      }

      const stopEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Guess the Number Game')
        .setDescription(`The game in ${channel} has been stopped manually.`)
        .setTimestamp();

      return interaction.reply({ embeds: [stopEmbed] });
    }
  },
};

module.exports.activeGames = activeGames;
