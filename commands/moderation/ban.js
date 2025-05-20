const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server.')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to ban').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for banning the user')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('duration')
        .setDescription('Duration for temporary ban (e.g., "2d1h30m40s")')
        .setRequired(false)
    ),

  async execute(interaction) {
    const { default: prettyMs } = await import('pretty-ms');
    const user = interaction.options.getUser('user');
    const reason =
      interaction.options.getString('reason') || 'No reason provided.';
    const duration = interaction.options.getString('duration');
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({
        content: 'The user is not in the server',
        ephemeral: true,
      });
    }
    const executor = interaction.member;
    const botMember = interaction.guild.members.cache.get(
      interaction.client.user.id
    );

    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({
        content: 'You do not have `BanMembers` permission to ban members!',
        ephemeral: true,
      });
    }

    if (member.roles.highest.position >= executor.roles.highest.position) {
      return interaction.reply({
        content:
          'You cannot ban this user as they have a higher or equal role.',
        ephemeral: true,
      });
    }
    if (member.roles.highest.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content:
          'I cannot ban this user as they have a higher or equal role than me.',
        ephemeral: true,
      });
    }

    const durationRegex = /^(?:\d+d)?(?:\d+h)?(?:\d+m)?(?:\d+s)?$/;
    let durationInMs = null;

    if (duration) {
      if (!durationRegex.test(duration)) {
        return interaction.reply({
          content: 'Invalid duration format! Use something like `1d2h30m40s`.',
          ephemeral: true,
        });
      }
      durationInMs = parseDuration(duration);
    }

    await member.ban({ reason });

    const banEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('Member Banned')
      .setDescription(`⛔ ${user.tag} has been banned from the server.`)
      .addFields(
        { name: 'Reason', value: reason, inline: true },
        {
          name: 'Banned by',
          value: `<@${interaction.user.id}>`,
          inline: true,
        },
        {
          name: 'Duration',
          value: durationInMs
            ? prettyMs(durationInMs, { verbose: true })
            : 'Permanent',
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [banEmbed] });

    if (durationInMs) {
      setTimeout(async () => {
        try {
          await interaction.guild.members.unban(
            user.id,
            'Temporary ban duration expired'
          );
        } catch (error) {
          console.error(`Failed to unban ${user.tag}:`, error);
        }
      }, durationInMs);
    }
  },
};

function parseDuration(duration) {
  const days =
    (duration.match(/(\d+)d/) ? parseInt(duration.match(/(\d+)d/)[1], 10) : 0) *
    24 *
    60 *
    60 *
    1000;
  const hours =
    (duration.match(/(\d+)h/) ? parseInt(duration.match(/(\d+)h/)[1], 10) : 0) *
    60 *
    60 *
    1000;
  const minutes =
    (duration.match(/(\d+)m/) ? parseInt(duration.match(/(\d+)m/)[1], 10) : 0) *
    60 *
    1000;
  const seconds =
    (duration.match(/(\d+)s/) ? parseInt(duration.match(/(\d+)s/)[1], 10) : 0) *
    1000;

  return days + hours + minutes + seconds;
}
