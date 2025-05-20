const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Displays information about the server.'),

  async execute(interaction) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`${guild.name}'s Info`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        {
          name: 'Member Count',
          value: `${guild.memberCount}`,
          inline: true,
        },
        {
          name: 'Created On',
          value: guild.createdAt.toDateString(),
          inline: true,
        },
        {
          name: 'Total Roles',
          value: `${guild.roles.cache.size}`,
          inline: true,
        },
        { name: 'Region', value: guild.preferredLocale, inline: true }
      )
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
