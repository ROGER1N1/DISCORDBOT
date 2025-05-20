const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Displays information about a specific role.')
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('The role to get information about')
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    const embed = new EmbedBuilder()
      .setColor(role.color === '0' ? 0x5865f2 : role.color)
      .setTitle(`${role.name} Info`)
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: role.hexColor, inline: true },
        {
          name: 'Members',
          value: role.members.size.toString(),
          inline: true,
        },
        {
          name: 'Position',
          value: role.position.toString(),
          inline: true,
        },
        {
          name: 'Created At',
          value: role.createdAt.toDateString(),
          inline: true,
        }
      )
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
