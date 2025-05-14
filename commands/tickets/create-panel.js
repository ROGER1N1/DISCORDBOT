const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const TicketSettings = require('../../models/TicketSettings');
const TicketCategory = require('../../models/TicketCategory');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createpanel')
    .setDescription('Creates a ticket panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Channel to send the ticket panel to')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('style')
        .setDescription('Panel style')
        .setRequired(true)
        .addChoices(
          { name: 'Buttons', value: 'buttons' },
          { name: 'Select Menu', value: 'select' }
        )
    )
    .addStringOption((option) =>
      option.setName('title').setDescription('Panel title').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('messageid')
        .setDescription(
          'ID of message to use as description (must be in same channel as panel)'
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('categories')
        .setDescription(
          'Category names separated by comma (e.g: support,billing,help)'
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('color')
        .setDescription('Panel color (hex)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const settings = await TicketSettings.findOne({
      guildId: interaction.guildId,
    });
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content:
          'You do not have `Administrator` permission to create a ticket panel!',
        ephemeral: true,
      });
    }
    if (!settings?.enabled) {
      return interaction.reply({
        content: '❌ Ticket system is not set up! Use `/ticketsetup` first.',
        ephemeral: true,
      });
    }

    const channel = interaction.options.getChannel('channel');
    const style = interaction.options.getString('style');
    const title = interaction.options.getString('title');
    const messageId = interaction.options.getString('messageid');
    const categoriesInput = interaction.options.getString('categories');
    const color = interaction.options.getString('color') || '#DDA0DD';

    try {
      const descriptionMessage = await channel.messages.fetch(messageId);
      if (!descriptionMessage) {
        return interaction.reply({
          content:
            '❌ Could not find message with that ID in the specified channel.',
          ephemeral: true,
        });
      }

      const categoryNames = categoriesInput.split(',').map((c) => c.trim());
      const categories = await TicketCategory.find({
        guildId: interaction.guildId,
        name: { $in: categoryNames },
      });

      if (categories.length === 0) {
        return interaction.reply({
          content:
            '❌ None of the specified categories were found! Create them using `/ticketcategory add` first.',
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(descriptionMessage.content)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: 'Lanya Ticket System' });

      let components = [];

      if (style === 'buttons') {
        const rows = [];
        let currentRow = new ActionRowBuilder();
        let buttonCount = 0;

        for (const category of categories) {
          if (buttonCount === 5) {
            rows.push(currentRow);
            currentRow = new ActionRowBuilder();
            buttonCount = 0;
          }

          const button = new ButtonBuilder()
            .setCustomId(`ticket_${category.name}`)
            .setLabel(category.name)
            .setEmoji(category.emoji)
            .setStyle(ButtonStyle.Primary);

          currentRow.addComponents(button);
          buttonCount++;
        }

        if (buttonCount > 0) {
          rows.push(currentRow);
        }

        components = rows;
      } else {
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('ticket_category')
          .setPlaceholder('Select a category')
          .addOptions(
            categories.map((cat) => ({
              label: cat.name,
              description: cat.description,
              value: cat.name,
              emoji: cat.emoji,
            }))
          );

        components = [new ActionRowBuilder().addComponents(selectMenu)];
      }

      await channel.send({
        embeds: [embed],
        components: components,
      });

      await interaction.reply({
        content: `✅ Ticket panel created in ${channel}!`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error creating panel:', error);
      await interaction.reply({
        content: '❌ An error occurred while creating the panel.',
        ephemeral: true,
      });
    }
  },
};
