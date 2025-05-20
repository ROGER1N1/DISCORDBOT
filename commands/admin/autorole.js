const { SlashCommandBuilder, EmbedBuilder, Role } = require('discord.js');
const AutoRole = require('../../models/AutoRoles'); // The model to store the auto-role

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Configure the auto-role system for new members')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Set roles to be automatically assigned to new members')
        .addRoleOption((option) =>
          option
            .setName('role')
            .setDescription('The role to assign to new members')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a role from the auto-role system')
        .addRoleOption((option) =>
          option
            .setName('role')
            .setDescription('The role to remove from auto-role assignments')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('view')
        .setDescription('View all roles assigned to new members')
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content:
          'You do not have the `Administrator` permission to manage auto-roles!',
        ephemeral: true,
      });
    }
    const { options, guild } = interaction;
    const subcommand = options.getSubcommand();
    const serverId = guild.id;

    // Fetch existing auto-role data for the server
    let autoRole = await AutoRole.findOne({ serverId });

    if (!autoRole) {
      autoRole = new AutoRole({ serverId, roleIds: [] });
      await autoRole.save();
    }

    if (subcommand === 'add') {
      const role = options.getRole('role');
      if (autoRole.roleIds.includes(role.id)) {
        return interaction.reply({
          content: `The role ${role.name} is already set as an auto-role.`,
          ephemeral: true,
        });
      }
      autoRole.roleIds.push(role.id);
      await autoRole.save();

      const embed = new EmbedBuilder()
        .setColor('#4CAF50')
        .setTitle('Auto-Roles Updated')
        .setDescription(
          `The role ${role.name} has been added to the list of auto-roles. New members will automatically receive this role when they join.`
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'remove') {
      const role = options.getRole('role');
      if (!autoRole.roleIds.includes(role.id)) {
        return interaction.reply({
          content: `The role ${role.name} is not set as an auto-role.`,
          ephemeral: true,
        });
      }
      autoRole.roleIds = autoRole.roleIds.filter((id) => id !== role.id);
      await autoRole.save();

      const embed = new EmbedBuilder()
        .setColor('#FF5733')
        .setTitle('Auto-Role Removed')
        .setDescription(
          `The role ${role.name} has been removed from the list of auto-roles.`
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'view') {
      if (autoRole.roleIds.length === 0) {
        return interaction.reply({
          content: 'No auto-roles have been set for this server.',
          ephemeral: true,
        });
      }

      const roleNames = autoRole.roleIds
        .map((roleId) => {
          const role = guild.roles.cache.get(roleId);
          return role ? role.name : `Unknown Role (ID: ${roleId})`;
        })
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor('#00BFFF')
        .setTitle('Configured Auto-Roles')
        .setDescription(
          `The following roles are automatically assigned to new members when they join:\n\n\`${roleNames}\``
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  },
};
