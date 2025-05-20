const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Displays information about a user.')
    .addUserOption((option) =>
      option.setName('target').setDescription('Select a user')
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`${user.username}'s Info`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        {
          name: 'Joined Server On',
          value: member.joinedAt.toDateString(),
          inline: true,
        },
        {
          name: 'Account Created On',
          value: user.createdAt.toDateString(),
          inline: true,
        },
        {
          name: 'Roles',
          value:
            member.roles.cache
              .filter((role) => role.id !== interaction.guild.id)
              .map((role) => role.toString())
              .join(', ') || 'None',
          inline: false,
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
