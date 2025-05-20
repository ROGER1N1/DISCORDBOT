const { Events, EmbedBuilder } = require('discord.js');
const ButtonRole = require('../models/ButtonRole');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'embed_setup') {
        const embed = new EmbedBuilder()
          .setTitle('Embed Setup Completed')
          .setDescription('Your embed message was setup successfully!')
          .setColor('Green');
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
      return;
    }

    if (interaction.isButton()) {
      const buttonId = interaction.customId;
      const panel = await ButtonRole.findOne({
        'buttons.customId': buttonId,
      });

      if (!panel) return;

      const button = panel.buttons.find((b) => b.customId === buttonId);
      const role = interaction.guild.roles.cache.get(button.roleId);

      if (!role) {
        const embed = new EmbedBuilder()
          .setTitle('Role Not Found')
          .setDescription(
            'The role associated with this button could not be found or no longer exists.'
          )
          .setColor('Red');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const member = interaction.member;
      const embed = new EmbedBuilder();

      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        embed
          .setTitle('Role Removed')
          .setDescription(
            `You have successfully removed the role **${role.name}**.`
          )
          .setColor('Red');
      } else {
        await member.roles.add(role);
        embed
          .setTitle('Role Added')
          .setDescription(
            `You have successfully added the role **${role.name}**.`
          )
          .setColor('Green');
      }

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
