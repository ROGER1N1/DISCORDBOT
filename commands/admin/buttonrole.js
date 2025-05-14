const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const ButtonRole = require('../../models/ButtonRole');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buttonrole')
    .setDescription('Manage button role panels')
    .addSubcommand((subcommand) =>
      subcommand.setName('setup').setDescription('Create a button role panel')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('send')
        .setDescription('Send a button role panel to a channel')
        .addStringOption((option) =>
          option
            .setName('panel_name')
            .setDescription('The name of the panel')
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'setup') {
      await handleSetup(interaction);
    } else if (subcommand === 'send') {
      await handleSend(interaction);
    }
  },
};

async function handleSetup(interaction) {
  if (!interaction.member.permissions.has('ManageRoles')) {
    return interaction.reply({
      content: 'You need the Manage Roles permission to use this command.',
      ephemeral: true,
    });
  }
  const panels = await ButtonRole.find({ guildId: interaction.guild.id });

  if (panels.length >= 25) {
    return await interaction.reply({
      content: `You have reached the maximum limit of ${maxButtonRoles} button roles in this server.`,
      ephemeral: true,
    });
  }

  const setupEmbed = new EmbedBuilder()
    .setTitle('Button Role Panel Setup')
    .setDescription(
      'Choose whether you want to create a **normal message** or an **embed message** for your button role panel.'
    )
    .setColor('Blue');

  const setupButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('normal_message')
      .setLabel('Normal Message')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('embed_message')
      .setLabel('Embed Message')
      .setStyle(ButtonStyle.Success)
  );

  const reply = await interaction.reply({
    embeds: [setupEmbed],
    components: [setupButtons],
    ephemeral: true,
  });

  const collector = reply.createMessageComponentCollector({ time: 60000 });

  collector.on('collect', async (buttonInteraction) => {
    if (buttonInteraction.user.id !== interaction.user.id) {
      return buttonInteraction.reply({
        content: 'This setup is not for you.',
        ephemeral: true,
      });
    }

    if (buttonInteraction.customId === 'normal_message') {
      await handleNormalMessageSetup(interaction, buttonInteraction);
    } else if (buttonInteraction.customId === 'embed_message') {
      await handleEmbedMessageSetup(interaction, buttonInteraction);
    }
  });

  collector.on('end', () => {
    interaction.editReply({ components: [] });
  });
}

async function handleNormalMessageSetup(interaction, buttonInteraction) {
  await buttonInteraction.deferUpdate();

  const messagePrompt = new EmbedBuilder()
    .setTitle('Normal Message Setup')
    .setDescription('Please type the message content for your panel.')
    .setColor('Blue');

  await interaction.channel.send({ embeds: [messagePrompt] });

  const collectorFilter = (m) => m.author.id === interaction.user.id;
  const messageResponse = await interaction.channel.awaitMessages({
    filter: collectorFilter,
    max: 1,
    time: 60000,
  });

  const messageContent = messageResponse.first().content;

  await savePanel(interaction, { type: 'message', content: messageContent });
}

async function handleEmbedMessageSetup(interaction, buttonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('embed_setup')
    .setTitle('Embed Setup');

  const titleInput = new TextInputBuilder()
    .setCustomId('embed_title')
    .setLabel('Title (optional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter the embed title')
    .setRequired(false);

  const descriptionInput = new TextInputBuilder()
    .setCustomId('embed_description')
    .setLabel('Description (required)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Enter the embed description')
    .setRequired(true);

  const footerInput = new TextInputBuilder()
    .setCustomId('embed_footer')
    .setLabel('Footer (optional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter the embed footer')
    .setRequired(false);

  const imageUriInput = new TextInputBuilder()
    .setCustomId('embed_image_uri')
    .setLabel('Image URI (optional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter the image URL')
    .setRequired(false);

  const modalActionRow1 = new ActionRowBuilder().addComponents(titleInput);
  const modalActionRow2 = new ActionRowBuilder().addComponents(
    descriptionInput
  );
  const modalActionRow3 = new ActionRowBuilder().addComponents(footerInput);
  const modalActionRow4 = new ActionRowBuilder().addComponents(imageUriInput);

  modal.addComponents(
    modalActionRow1,
    modalActionRow2,
    modalActionRow3,
    modalActionRow4
  );

  await buttonInteraction.showModal(modal);

  const submitted = await buttonInteraction.awaitModalSubmit({ time: 60000 });

  const title = submitted.fields.getTextInputValue('embed_title') || null;
  const description = submitted.fields.getTextInputValue('embed_description');
  const footer = submitted.fields.getTextInputValue('embed_footer') || null;
  const imageUri =
    submitted.fields.getTextInputValue('embed_image_uri') || null;

  const embedData = {
    type: 'embed',
    content: { title, description, footer, imageUri },
  };

  await savePanel(interaction, embedData);
}

async function savePanel(interaction, panelData) {
  const collectorFilter = (m) => m.author.id === interaction.user.id;

  let panelName = '';
  let panelExists = true;

  while (panelExists) {
    const panelNamePrompt = new EmbedBuilder()
      .setTitle('Panel Name')
      .setDescription('What will the panel be called?')
      .setColor('Blue');
    await interaction.channel.send({ embeds: [panelNamePrompt] });

    const panelNameResponse = await interaction.channel.awaitMessages({
      filter: collectorFilter,
      max: 1,
      time: 60000,
    });
    panelName = panelNameResponse.first().content;

    const existingPanel = await ButtonRole.findOne({
      guildId: interaction.guild.id,
      panelName,
    });

    if (existingPanel) {
      await interaction.channel.send({
        content: `A panel with the name **${panelName}** already exists. Please choose another name.`,
      });
    } else {
      panelExists = false;
    }
  }

  const buttons = [];
  let addingButtons = true;

  while (addingButtons) {
    const buttonLabelPrompt = new EmbedBuilder()
      .setTitle('Button Label')
      .setDescription('Enter a button label:')
      .setColor('Blue');
    await interaction.channel.send({ embeds: [buttonLabelPrompt] });

    const labelResponse = await interaction.channel.awaitMessages({
      filter: collectorFilter,
      max: 1,
      time: 60000,
    });
    const label = labelResponse.first().content;

    const buttonRolePrompt = new EmbedBuilder()
      .setTitle('Button Role')
      .setDescription('Mention the role or provide the role ID:')
      .setColor('Blue');
    await interaction.channel.send({ embeds: [buttonRolePrompt] });

    const roleResponse = await interaction.channel.awaitMessages({
      filter: collectorFilter,
      max: 1,
      time: 60000,
    });
    const roleId =
      roleResponse.first().mentions.roles.first()?.id ||
      roleResponse.first().content;

    const buttonStylePrompt = new EmbedBuilder()
      .setTitle('Button Style')
      .setDescription(
        'Choose a button style: `Primary`, `Secondary`, `Success`, `Danger`'
      )
      .setColor('Blue');
    await interaction.channel.send({ embeds: [buttonStylePrompt] });

    const styleResponse = await interaction.channel.awaitMessages({
      filter: collectorFilter,
      max: 1,
      time: 60000,
    });
    const style =
      ButtonStyle[styleResponse.first().content] || ButtonStyle.Primary;

    const customId = `${interaction.guild.id}-${Date.now()}-${buttons.length}`;
    buttons.push({ label, roleId, style, customId });

    const continuePrompt = new EmbedBuilder()
      .setTitle('Add Another Button?')
      .setDescription('Do you want to add another button? (yes/no)')
      .setColor('Blue');
    await interaction.channel.send({ embeds: [continuePrompt] });

    const continueResponse = await interaction.channel.awaitMessages({
      filter: collectorFilter,
      max: 1,
      time: 60000,
    });
    if (continueResponse.first().content.toLowerCase() !== 'yes')
      addingButtons = false;
  }

  const targetChannelPrompt = new EmbedBuilder()
    .setTitle('Target Channel')
    .setDescription('Mention the channel to send the panel to:')
    .setColor('Blue');
  await interaction.channel.send({ embeds: [targetChannelPrompt] });

  const channelResponse = await interaction.channel.awaitMessages({
    filter: collectorFilter,
    max: 1,
    time: 60000,
  });
  const channelId =
    channelResponse.first().mentions.channels.first()?.id ||
    channelResponse.first().content;

  const buttonRole = new ButtonRole({
    guildId: interaction.guild.id,
    panelName,
    panelData,
    buttons,
    channelId,
  });

  await buttonRole.save();

  const successEmbed = new EmbedBuilder()
    .setTitle('Panel Saved')
    .setDescription(`Your panel **${panelName}** has been saved successfully.`)
    .setColor('Green');

  await interaction.channel.send({ embeds: [successEmbed] });
}

async function handleSend(interaction) {
  if (!interaction.member.permissions.has('ManageRoles')) {
    return interaction.reply({
      content: 'You need the Manage Roles permission to use this command.',
      ephemeral: true,
    });
  }
  const panelName = interaction.options.getString('panel_name');

  const buttonRole = await ButtonRole.findOne({
    guildId: interaction.guild.id,
    panelName,
  });

  if (!buttonRole) {
    return interaction.reply({
      content: `Panel **${panelName}** not found.`,
      ephemeral: true,
    });
  }

  const channel = interaction.guild.channels.cache.get(buttonRole.channelId);
  if (!channel) {
    return interaction.reply({
      content: `The channel for panel **${panelName}** could not be found.`,
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setDescription(buttonRole.panelData.content.description)
    .setColor('Blue');

  if (buttonRole.panelData.content.title) {
    embed.setTitle(buttonRole.panelData.content.title);
  }

  if (buttonRole.panelData.content.footer) {
    embed.setFooter({ text: buttonRole.panelData.content.footer });
  }

  if (buttonRole.panelData.content.imageUri) {
    embed.setImage(buttonRole.panelData.content.imageUri);
  }

  const row = new ActionRowBuilder();

  buttonRole.buttons.forEach((button) => {
    row.addComponents(
      new ButtonBuilder()
        .setLabel(button.label)
        .setStyle(button.style)
        .setCustomId(button.customId)
    );
  });

  await channel.send({ embeds: [embed], components: [row] });

  await interaction.reply({
    content: `Panel **${panelName}** sent to <#${buttonRole.channelId}>.`,
    ephemeral: true,
  });
}
