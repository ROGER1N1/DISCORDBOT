const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require('discord.js');
const { path } = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription(
      'Nuke the current text channel by cloning it and deleting the original.'
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageChannels')) {
      return interaction.reply({
        content: 'You do not have `ManageChannels` permission to nuke members!',
        ephemeral: true,
      });
    }
    const channelToNuke = interaction.channel;

    if (channelToNuke.type !== 0) {
      return interaction.reply(
        'This command can only be used in text channels.'
      );
    }

    try {
      const channelName = channelToNuke.name;
      const channelPosition = channelToNuke.position;

      const newChannel = await channelToNuke.clone({
        name: channelName,
        position: channelPosition,
        reason: 'Channel nuked by command',
      });

      await channelToNuke.delete('Channel nuked by command');
      const attachment = new AttachmentBuilder('./utils/nuke.gif');
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('💣 Channel Nuked! 💣')
        .setImage('attachment://nuke.gif')
        .setFooter({ text: `Nuked by ${interaction.user.tag}.` })
        .setTimestamp();

      const nukeMessage = await newChannel.send({
        embeds: [embed],
        files: [attachment],
      });

      setTimeout(async () => {
        await nukeMessage.delete();
      }, 30000);
    } catch (error) {
      console.error('Error during nuke operation:', error);
      await interaction.reply('There was an error trying to nuke the channel.');
    }
  },
};
