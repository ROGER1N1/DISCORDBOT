const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const warnings = require('../../models/warnings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Get warnings of user')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to ban').setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('page')
        .setDescription('The page to display if there are more than 1')
        .setMinValue(2)
        .setMaxValue(20)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('KickMembers')) {
      return interaction.reply({
        content: 'You do not have `KickMembers` permission to view warnings',
        ephemeral: true,
      });
    }
    const user = interaction.options.getUser('user');
    const page = interaction.options.getInteger('page');

    const userWarnings = await warnings.find({
      userId: user.id,
      guildId: interaction.guild.id,
    });

    if (!userWarnings?.length)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('User Warn Logs')
            .setDescription(`${user} has no warn logs`)
            .setColor(0xff0000),
        ],
      });

    const embed = new EmbedBuilder()
      .setTitle(`${user.tag}'s warn logs`)
      .setColor(16705372);

    if (page) {
      const pageNum = 5 * page - 5;

      if (userWarnings.length >= 6) {
        embed.setFooter({
          text: `page ${page} of ${Math.ceil(userWarnings.length / 5)}`,
        });
      }

      for (const warnings of userWarnings.splice(pageNum, 5)) {
        const moderator = interaction.guild.members.cache.get(
          warnings.moderator
        );

        embed.addFields({
          name: `id: ${warnings._id}`,
          value: `
            👷🏼 Moderator: ${moderator || 'Moderator left'}
            👤 User: <@${warnings.userId}>
            📄 Reason: ${warnings.warnReason}
            📅 Date: ${warnings.warnDate}
            `,
        });
      }

      return await interaction.reply({ embeds: [embed] });
    }

    if (userWarnings.length >= 6) {
      embed.setFooter({
        text: `page 1 of ${Math.ceil(userWarnings.length / 5)}`,
      });
    }

    for (const warnings of userWarnings.slice(0, 5)) {
      const moderator = interaction.guild.members.cache.get(warnings.moderator);

      embed.addFields({
        name: `id: ${warnings._id}`,
        value: `
        👷🏼 Moderator: ${moderator || 'Moderator left'}
        👤 User: <@${warnings.userId}>
        📄 Reason: ${warnings.warnReason}
        📅 Date: ${warnings.warnDate}
        `,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
