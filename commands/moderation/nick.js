const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription("Change your or another user's nickname.")
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription(
          'The user to change the nickname for (leave blank to change your own)'
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('nickname')
        .setDescription('The new nickname')
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const nickname = interaction.options.getString('nickname');

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return await interaction.reply('User not found in this guild.');
    }

    if (
      interaction.member.permissions.has('ManageNicknames') ||
      user.id === interaction.user.id
    ) {
      try {
        await member.setNickname(nickname);
        return await interaction.reply(
          `Nickname for **${user.username}** has been changed to **${nickname}**.`
        );
      } catch (error) {
        console.error(error);
        return await interaction.reply(
          "I am unable to change this user's nickname. Please check my permissions."
        );
      }
    } else {
      return await interaction.reply(
        'You do not have `ManageNicknames` permission to change nicknames.'
      );
    }
  },
};
