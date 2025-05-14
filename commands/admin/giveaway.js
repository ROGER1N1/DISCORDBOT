const { SlashCommandBuilder } = require('@discordjs/builders');
const startGiveaway = require('../../functions/startGiveaway');
const endGiveaway = require('../../functions/endGiveaway');
const rerollGiveaway = require('../../functions/rerollGiveaway');
const listGiveaways = require('../../functions/listGiveaway');
const cancelGiveaway = require('../../functions/cancelGiveaway');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Manage giveaways')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('start')
        .setDescription('Start a new giveaway')
        .addStringOption((option) =>
          option
            .setName('duration')
            .setDescription('The duration of the giveaway (e.g., 1d1h1m1s)')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('prize')
            .setDescription('The prize of the giveaway')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('winners')
            .setDescription('Number of winners for the giveaway')
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName('required_role')
            .setDescription('Optional: Role required to join the giveaway')
        )
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('Optional: Channel to host the giveaway.')
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('reroll')
        .setDescription('Reroll the giveaway to select new winners')
        .addStringOption((option) =>
          option
            .setName('message_id')
            .setDescription('The message ID of the giveaway')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('end')
        .setDescription('End an ongoing giveaway')
        .addStringOption((option) =>
          option
            .setName('message_id')
            .setDescription('The message ID of the giveaway')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('cancel')
        .setDescription('Cancel an ongoing giveaway')
        .addStringOption((option) =>
          option
            .setName('message_id')
            .setDescription('The message ID of the giveaway')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('List all ongoing giveaways in the server')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content:
          'You do not have `Administrator` permission to manage giveaways!',
        ephemeral: true,
      });
    }

    switch (subcommand) {
      case 'start':
        await startGiveaway(interaction);
        break;
      case 'reroll':
        await rerollGiveaway(interaction);
        break;
      case 'end':
        await endGiveaway(interaction);
        break;
      case 'cancel':
        await cancelGiveaway(interaction);
        break;
      case 'list':
        await listGiveaways(interaction);
        break;
      default:
        await interaction.reply({
          content: 'Invalid subcommand!',
          ephemeral: true,
        });
    }
  },
};
