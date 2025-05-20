const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const TicketCategory = require('../../models/TicketCategory');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketcategory')
    .setDescription('Manage ticket categories')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add a new ticket category')
        .addStringOption((option) =>
          option
            .setName('name')
            .setDescription('Name of the category')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('description')
            .setDescription('Description of the category')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('emoji')
            .setDescription('Emoji for the category')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a ticket category')
        .addStringOption((option) =>
          option
            .setName('name')
            .setDescription('Name of the category to remove')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('List all ticket categories')
    ),

  async execute(interaction) {
    try {
      if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({
          content:
            'You do not have `Administrator` permission to manage ticket categories!',
          ephemeral: true,
        });
      }
      const subcommand = interaction.options.getSubcommand();

      switch (subcommand) {
        case 'add': {
          const name = interaction.options.getString('name');
          const description = interaction.options.getString('description');
          const emoji = interaction.options.getString('emoji');

          const existingCategory = await TicketCategory.findOne({
            guildId: interaction.guildId,
            name: name,
          });

          if (existingCategory) {
            return interaction.reply({
              content: '❌ A category with that name already exists!',
              ephemeral: true,
            });
          }

          await TicketCategory.create({
            guildId: interaction.guildId,
            name: name,
            description: description,
            emoji: emoji,
          });

          await interaction.reply({
            content: `✅ Added ticket category: ${emoji} ${name}`,
            ephemeral: true,
          });
          break;
        }
        case 'remove': {
          const name = interaction.options.getString('name');
          const result = await TicketCategory.findOneAndDelete({
            guildId: interaction.guildId,
            name: name,
          });

          if (!result) {
            return interaction.reply({
              content: '❌ Category not found!',
              ephemeral: true,
            });
          }

          await interaction.reply({
            content: `✅ Removed ticket category: ${name}`,
            ephemeral: true,
          });
          break;
        }
        case 'list': {
          const categories = await TicketCategory.find({
            guildId: interaction.guildId,
          });

          if (categories.length === 0) {
            return interaction.reply({
              content:
                '❌ No ticket categories found! Create some using `/ticketcategory add`',
              ephemeral: true,
            });
          }

          const embed = new EmbedBuilder()
            .setTitle('Ticket Categories')
            .setColor('#DDA0DD')
            .setDescription(
              categories
                .map(
                  (cat) => `${cat.emoji} **${cat.name}**\n${cat.description}`
                )
                .join('\n\n')
            );

          await interaction.reply({
            embeds: [embed],
            ephemeral: true,
          });
          break;
        }
      }
    } catch (error) {
      console.error('Error managing ticket categories:', error);
      await interaction.reply({
        content: '❌ An error occurred while managing ticket categories.',
        ephemeral: true,
      });
    }
  },
};
