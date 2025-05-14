const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');
const TicketSettings = require('../../models/TicketSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketsetup')
    .setDescription('Configure the ticket system')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption((option) =>
      option
        .setName('support_role')
        .setDescription('Role that can see tickets')
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('category')
        .setDescription('Category for tickets')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('logs')
        .setDescription('Channel for ticket logs')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('Maximum tickets per user')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content: 'You do not have `Administrator` permission to setup Tickets!',
        ephemeral: true,
      });
    }
    const supportRole = interaction.options.getRole('support_role');
    const category = interaction.options.getChannel('category');
    const logs = interaction.options.getChannel('logs');
    const limit = interaction.options.getInteger('limit') || 3;

    try {
      await TicketSettings.findOneAndUpdate(
        { guildId: interaction.guildId },
        {
          guildId: interaction.guildId,
          enabled: true,
          categoryId: category.id,
          logChannelId: logs.id,
          supportRoleIds: [supportRole.id],
          ticketLimit: limit,
        },
        { upsert: true, new: true }
      );

      await interaction.reply({
        content: '✅ Ticket system has been configured successfully!',
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ An error occurred while setting up the ticket system.',
        ephemeral: true,
      });
    }
  },
};
