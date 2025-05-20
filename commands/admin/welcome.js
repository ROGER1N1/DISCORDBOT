const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');
const Welcome = require('../../models/welcome');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure the welcome system')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('toggle')
        .setDescription('Enable or disable the welcome system')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('description')
        .setDescription('Set the custom welcome message description')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('setchannel')
        .setDescription('Set the welcome channel')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('The channel to send welcome messages')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('test')
        .setDescription('Preview the current welcome message')
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content:
          'You do not have the `Administrator` permission to manage the welcome system!',
        ephemeral: true,
      });
    }
    const { options, guild, user } = interaction;
    const serverId = guild.id;
    const subcommand = options.getSubcommand();

    let welcome = await Welcome.findOne({ serverId });

    if (!welcome) {
      welcome = new Welcome({ serverId });
      await welcome.save();
    }

    if (subcommand === 'toggle') {
      welcome.enabled = !welcome.enabled;
      await welcome.save();
      const toggleEmbed = new EmbedBuilder()
        .setColor(welcome.enabled ? '#4CAF50' : '#FF5733')
        .setTitle('Welcome System')
        .setDescription(
          `The welcome system is now ${welcome.enabled ? 'enabled' : 'disabled'}. \n\n __**Note:** Please set the channel for sending the welcome greetings by using \`/welcome setchannel\`__`
        )
        .setTimestamp();
      return interaction.reply({ embeds: [toggleEmbed] });
    }

    if (subcommand === 'description') {
      if (!welcome.enabled) {
        return interaction.reply({
          content: 'The Welcome System is not enabled in this server!',
        });
      }
      const descriptionEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('Set Custom Welcome Message')
        .setDescription(
          '**Please provide your custom welcome message. You can use the following placeholders:**\n\n' +
            "`{member}` - Member's username\n" +
            '`{server}` - Server name\n' +
            '`{serverid}` - Server ID\n' +
            '`{userid}` - User ID\n' +
            '`{joindate}` - Join date\n' +
            '`{accountage}` - Account age\n' +
            '`{membercount}` - Member count\n' +
            '`{serverage}` - Server age (in days)\n\n' +
            '__**Note:** This command will expire in 5 minutes__'
        )
        .setTimestamp();

      await interaction.reply({
        embeds: [descriptionEmbed],
        ephemeral: true,
      });

      const filter = (response) => response.author.id === user.id;
      const collector = interaction.channel.createMessageCollector({
        filter,
        time: 300000,
      });

      collector.on('collect', async (message) => {
        const customDescription = message.content;

        welcome.description = customDescription;
        await welcome.save();

        const successEmbed = new EmbedBuilder()
          .setColor('#4CAF50')
          .setTitle('Custom Welcome Message Set')
          .setDescription(
            `Your welcome message has been updated to:\n${customDescription}`
          )
          .setTimestamp();
        interaction.followUp({
          embeds: [successEmbed],
          ephemeral: true,
        });

        collector.stop();
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          const timeoutEmbed = new EmbedBuilder()
            .setColor('#FF5733')
            .setTitle('Timeout')
            .setDescription(
              'You took too long to provide a description. Please try again.'
            )
            .setTimestamp();
          interaction.followUp({
            embeds: [timeoutEmbed],
            ephemeral: true,
          });
        }
      });
    }

    if (subcommand === 'setchannel') {
      if (!welcome.enabled) {
        return interaction.reply({
          content: 'The Welcome System is not enabled in this server!',
        });
      }
      const channel = interaction.options.getChannel('channel');

      welcome.channelId = channel.id;
      await welcome.save();

      const channelEmbed = new EmbedBuilder()
        .setColor('#4CAF50')
        .setTitle('Welcome Channel Set')
        .setDescription(`The welcome channel has been set to ${channel}.`)
        .setTimestamp();
      return interaction.reply({
        embeds: [channelEmbed],
        ephemeral: true,
      });
    }

    if (subcommand === 'test') {
      if (!welcome.enabled) {
        return interaction.reply({
          content: 'The Welcome System is not enabled in this server!',
        });
      }
      const memberCount = guild.memberCount;

      let description = welcome.description || 'Welcome {member} to {server}';
      description = description
        .replace(/{member}/g, interaction.user)
        .replace(/{server}/g, guild.name)
        .replace(/{serverid}/g, guild.id)
        .replace(/{userid}/g, user.id)
        .replace(/{joindate}/g, `<t:${Math.floor(Date.now() / 1000)}:F>`)
        .replace(/{accountage}/g, `<t:${Math.floor(user.createdAt / 1000)}:R>`)
        .replace(/{membercount}/g, memberCount)
        .replace(/{serverage}/g, `<t:${Math.floor(guild.createdAt / 1000)}:R>`);

      const testEmbed = new EmbedBuilder()
        .setColor('#00BFFF')
        .setTitle('Welcome Message Preview')
        .setDescription(description)
        .setFooter({
          text: 'This is how the welcome message will look like when a member joins.',
        })
        .setTimestamp();

      return interaction.reply({ embeds: [testEmbed], ephemeral: true });
    }
  },
};
