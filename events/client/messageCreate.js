const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    if (message.author.bot) return;

    const mention = new RegExp(`^<@!?${message.client.user.id}>( |)$`);

    if (message.content.match(mention)) {
      try {
        const commands = await message.client.application.commands.fetch();

        const helpCommand = commands.find((cmd) => cmd.name === 'help');
        const helpCommandId = helpCommand ? helpCommand.id : 'unknown';

        const mentionEmbed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setDescription(
            `Hey ${message.author}, I'm Lanya, I use \`/\` commands.\nCheck out my commands, type </help:${helpCommandId}>`
          )
          .setTimestamp();

        message.reply({ embeds: [mentionEmbed] }).catch(console.error);
      } catch (error) {
        console.error('Error fetching commands:', error);
      }
    }
  },
};
