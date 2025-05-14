const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  time,
} = require('discord.js');
const { Types } = require('mongoose');

const warnings = require('../../models/warnings');

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setName('warn')
    .setDescription('Warn a user or remove a warn')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Warn a user')
        .addUserOption((option) => {
          return option
            .setName('user')
            .setDescription('The user to warn')
            .setRequired(true);
        })
        .addStringOption((option) => {
          return option
            .setName('reason')
            .setDescription('The reason for the warn')
            .setRequired(true)
            .setMaxLength(500);
        })
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a warn from a user')
        .addStringOption((option) => {
          return option
            .setName('warn_id')
            .setDescription('The id of the warn to remove')
            .setRequired(true)
            .setMinLength(24)
            .setMaxLength(24);
        })
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('KickMembers')) {
      return interaction.reply({
        content: 'You do not have `KickMembers` permission to manage warnings!',
        ephemeral: true,
      });
    }
    switch (interaction.options.getSubcommand()) {
      case 'add':
        {
          const { options, guild, member } = interaction;
          const user = options.getUser('user');
          const reason = options.getString('reason');
          const warnTime = time();

          const warnSchema = new warnings({
            _id: new Types.ObjectId(),
            guildId: guild.id,
            userId: user.id,
            warnReason: reason,
            moderator: member.user.id,
            warnDate: warnTime,
          });

          warnSchema.save().catch((error) => console.log(error));

          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Member Warned')
                .setDescription(`⚠️ <@${user.id}> has been warned`)
                .addFields(
                  {
                    name: 'Reason',
                    value: `${reason}`,
                    inline: true,
                  },
                  {
                    name: 'Warned by',
                    value: `<@${interaction.user.id}>`,
                    inline: true,
                  }
                )
                .setTimestamp(),
            ],
          });

          user
            .send({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`⚠️You have been warned in: ${guild.name}`)
                  .addFields(
                    {
                      name: 'Reason',
                      value: `${reason}`,
                      inline: true,
                    },
                    {
                      name: 'Warned by',
                      value: `<@${interaction.user.id}>`,
                      inline: true,
                    }
                  )
                  .setTimestamp()
                  .setColor(0xff0000),
              ],
            })
            .catch(async (error) => {
              console.log(error);
              await interaction.followUp({
                embeds: [
                  new EmbedBuilder()
                    .setTitle('❌ User has dms disabled so no DM was sent.')
                    .setColor(0xff0000),
                ],
              });
            });
        }
        break;

      case 'remove': {
        const guildId = interaction.guild.id;
        const warnId = interaction.options.getString('warn_id');

        const error = new EmbedBuilder()
          .setDescription(`No warn Id watching \`${warnId}\` was found!`)
          .setColor(0xed4245);
        data = await warnings.findOne({ _id: warnId, guildId: guildId });
        if (!data) return await interaction.reply({ embeds: [error] });

        await warnings.deleteOne({ _id: warnId, guildId: guildId });

        const embed = new EmbedBuilder()
          .setTitle('Remove Infraction')
          .setDescription(
            `Successfully removed the warn with the ID matching \`${warnId}\``
          )
          .setColor(5763719)
          .setTimestamp();
        return await interaction.reply({ embeds: [embed] });
      }
    }
  },
};
