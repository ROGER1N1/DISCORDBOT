const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');
const Ticket = require('../../models/Ticket');
const TicketBan = require('../../models/TicketBan');
const TicketSettings = require('../../models/TicketSettings');
const closeTicket = require('../../functions/closeTicket');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket management commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('close')
        .setDescription('Close a ticket')
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('Reason for closing the ticket')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('transfer')
        .setDescription('Transfer a ticket to another staff member')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('User to transfer the ticket to')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('ban')
        .setDescription('Ban a user from creating tickets')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('User to ban from tickets')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('Reason for the ticket ban')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('unban')
        .setDescription('Unban a user from creating tickets')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('User to unban from tickets')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add a user to the ticket')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('User to add to the ticket')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a user from the ticket')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('User to remove from the ticket')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const settings = await TicketSettings.findOne({
      guildId: interaction.guildId,
    });

    if (!settings?.enabled) {
      return interaction.reply({
        content: '❌ Ticket system is not enabled in this server.',
        ephemeral: true,
      });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const hasPermission = settings.supportRoleIds.some((roleId) =>
      member.roles.cache.has(roleId)
    );

    if (!hasPermission) {
      return interaction.reply({
        content:
          '❌ You do not have permission to use ticket management commands!',
        ephemeral: true,
      });
    }

    switch (subcommand) {
      case 'close': {
        try {
          if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({
              content: '❌ This command can only be used in ticket channels!',
              ephemeral: true,
            });
          }

          const reason =
            interaction.options.getString('reason') || 'No reason provided';

          await interaction.deferReply();
          await closeTicket(interaction.channel, interaction.user, reason);
        } catch (error) {
          console.error('Error in close command:', error);
          await interaction.editReply({
            content: `❌ Error: ${error.message}`,
            ephemeral: true,
          });
        }
        break;
      }

      case 'transfer': {
        if (!interaction.channel.name.startsWith('ticket-')) {
          return interaction.reply({
            content: '❌ This command can only be used in ticket channels!',
            ephemeral: true,
          });
        }

        await interaction.deferReply();

        const targetUser = interaction.options.getUser('user');
        const ticket = await Ticket.findOne({
          channelId: interaction.channel.id,
          status: 'open',
        });

        if (!ticket) {
          return interaction.editReply(
            '❌ No active ticket found for this channel.'
          );
        }

        const targetMember = await interaction.guild.members.fetch(
          targetUser.id
        );
        const hasPermission = settings.supportRoleIds.some((roleId) =>
          targetMember.roles.cache.has(roleId)
        );

        if (!hasPermission) {
          return interaction.editReply(
            '❌ You can only transfer tickets to support staff members!'
          );
        }

        if (ticket.claimedBy && ticket.claimedBy !== interaction.user.id) {
          const claimer = await interaction.client.users.fetch(
            ticket.claimedBy
          );
          return interaction.editReply(
            `❌ This ticket is claimed by ${claimer.tag}. Only they can transfer it.`
          );
        }

        ticket.claimedBy = targetUser.id;
        ticket.claimedAt = new Date();
        await ticket.save();

        const transferEmbed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle('Ticket Transferred')
          .setDescription(
            `🔄 This ticket has been transferred to ${targetUser.toString()}`
          )
          .addFields(
            {
              name: 'From',
              value: interaction.user.toString(),
              inline: true,
            },
            {
              name: 'To',
              value: targetUser.toString(),
              inline: true,
            },
            {
              name: 'Ticket ID',
              value: ticket.ticketId,
              inline: true,
            }
          )
          .setTimestamp();

        const closeButton = new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger);

        const viewClaimButton = new ButtonBuilder()
          .setCustomId('view_claim')
          .setLabel(`Claimed by ${targetUser.username}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true);

        const row = new ActionRowBuilder().addComponents(
          viewClaimButton,
          closeButton
        );

        const messages = await interaction.channel.messages.fetch({
          limit: 10,
        });
        const claimMessage = messages.find(
          (m) =>
            m.author.id === interaction.client.user.id &&
            m.components.length > 0 &&
            m.components[0].components.some(
              (c) =>
                c.customId === 'claim_ticket' || c.customId === 'view_claim'
            )
        );

        if (claimMessage) {
          await claimMessage.edit({ components: [row] });
        }

        await interaction.editReply({ embeds: [transferEmbed] });

        if (settings.logChannelId) {
          const logChannel = interaction.guild.channels.cache.get(
            settings.logChannelId
          );
          if (logChannel) {
            await logChannel.send({ embeds: [transferEmbed] });
          }
        }
        break;
      }

      case 'ban': {
        const targetUser = interaction.options.getUser('user');
        const reason =
          interaction.options.getString('reason') || 'No reason provided';

        const existingBan = await TicketBan.findOne({
          guildId: interaction.guildId,
          userId: targetUser.id,
        });

        if (existingBan) {
          return interaction.reply({
            content: '❌ This user is already banned from creating tickets!',
            ephemeral: true,
          });
        }

        await TicketBan.create({
          guildId: interaction.guildId,
          userId: targetUser.id,
          reason: reason,
          moderatorId: interaction.user.id,
        });

        const banEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Ticket Ban')
          .setDescription(
            `🚫 ${targetUser.toString()} has been banned from creating tickets`
          )
          .addFields(
            { name: 'Reason', value: reason, inline: true },
            {
              name: 'Moderator',
              value: interaction.user.toString(),
              inline: true,
            }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [banEmbed] });
        break;
      }

      case 'unban': {
        const targetUser = interaction.options.getUser('user');

        const existingBan = await TicketBan.findOneAndDelete({
          guildId: interaction.guildId,
          userId: targetUser.id,
        });

        if (!existingBan) {
          return interaction.reply({
            content: '❌ This user is not banned from creating tickets!',
            ephemeral: true,
          });
        }

        const unbanEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('Ticket Unban')
          .setDescription(
            `✅ ${targetUser.toString()} has been unbanned from creating tickets`
          )
          .addFields({
            name: 'Moderator',
            value: interaction.user.toString(),
            inline: true,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [unbanEmbed] });
        break;
      }

      case 'add': {
        if (!interaction.channel.name.startsWith('ticket-')) {
          return interaction.reply({
            content: '❌ This command can only be used in ticket channels!',
            ephemeral: true,
          });
        }

        const targetUser = interaction.options.getUser('user');
        const ticket = await Ticket.findOne({
          channelId: interaction.channel.id,
          status: 'open',
        });

        if (!ticket) {
          return interaction.reply({
            content: '❌ No active ticket found for this channel!',
            ephemeral: true,
          });
        }

        if (
          interaction.channel
            .permissionsFor(targetUser)
            ?.has(PermissionFlagsBits.ViewChannel)
        ) {
          return interaction.reply({
            content: '❌ This user already has access to the ticket!',
            ephemeral: true,
          });
        }

        await interaction.channel.permissionOverwrites.edit(targetUser, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
        });

        const addEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('User Added to Ticket')
          .setDescription(
            `✅ ${targetUser.toString()} has been added to the ticket by ${interaction.user.toString()}`
          )
          .setTimestamp();

        await interaction.reply({ embeds: [addEmbed] });
        break;
      }

      case 'remove': {
        if (!interaction.channel.name.startsWith('ticket-')) {
          return interaction.reply({
            content: '❌ This command can only be used in ticket channels!',
            ephemeral: true,
          });
        }

        const targetUser = interaction.options.getUser('user');
        const ticket = await Ticket.findOne({
          channelId: interaction.channel.id,
          status: 'open',
        });

        if (!ticket) {
          return interaction.reply({
            content: '❌ No active ticket found for this channel!',
            ephemeral: true,
          });
        }

        if (targetUser.id === ticket.userId) {
          return interaction.reply({
            content: '❌ You cannot remove the ticket creator!',
            ephemeral: true,
          });
        }

        if (
          !interaction.channel
            .permissionsFor(targetUser)
            ?.has(PermissionFlagsBits.ViewChannel)
        ) {
          return interaction.reply({
            content: '❌ This user does not have access to the ticket!',
            ephemeral: true,
          });
        }

        await interaction.channel.permissionOverwrites.delete(targetUser);

        const removeEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('User Removed from Ticket')
          .setDescription(
            `❌ ${targetUser.toString()} has been removed from the ticket by ${interaction.user.toString()}`
          )
          .setTimestamp();

        await interaction.reply({ embeds: [removeEmbed] });
        break;
      }
    }
  },
};
