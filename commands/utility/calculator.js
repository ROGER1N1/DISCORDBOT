const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calculator')
    .setDescription('A simple scientific calculator.'),

  async execute(interaction) {
    let currentInput = '';
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Scientific Calculator')
      .setDescription(`\`\`\`${currentInput || '          '}\`\`\``);

    const mainRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('clear')
        .setLabel('C')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('pi')
        .setLabel('π')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('power')
        .setLabel('^')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('percent')
        .setLabel('%')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('decimal')
        .setLabel('.')
        .setStyle(ButtonStyle.Secondary)
    );

    const numberRow1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('7')
        .setLabel('7')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('8')
        .setLabel('8')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('9')
        .setLabel('9')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('divide')
        .setLabel('➗')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('add')
        .setLabel('➕')
        .setStyle(ButtonStyle.Primary)
    );

    const numberRow2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('4')
        .setLabel('4')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('5')
        .setLabel('5')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('6')
        .setLabel('6')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('subtract')
        .setLabel('➖')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('multiply')
        .setLabel('✖️')
        .setStyle(ButtonStyle.Primary)
    );

    const numberRow3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('1')
        .setLabel('1')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('2')
        .setLabel('2')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('3')
        .setLabel('3')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('equals')
        .setLabel('=')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('back')
        .setLabel('←')
        .setStyle(ButtonStyle.Secondary)
    );

    const numberRow4 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('0')
        .setLabel('0')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('open-bracket')
        .setLabel('(')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('close-bracket')
        .setLabel(')')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('end-session')
        .setLabel('End Session')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [mainRow, numberRow1, numberRow2, numberRow3, numberRow4],
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
    });

    collector.on('collect', async (buttonInteraction) => {
      if (
        ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(
          buttonInteraction.customId
        )
      ) {
        currentInput += buttonInteraction.customId;
      } else if (buttonInteraction.customId === 'decimal') {
        if (!currentInput.endsWith('.')) {
          currentInput += '.';
        }
      } else if (buttonInteraction.customId === 'clear') {
        currentInput = '';
      } else if (buttonInteraction.customId === 'back') {
        currentInput = currentInput.slice(0, -1);
      } else if (buttonInteraction.customId === 'equals') {
        const result = evaluateExpression(currentInput);
        currentInput = result.toString();
      } else if (buttonInteraction.customId === 'end-session') {
        collector.stop();
        return;
      } else {
        if (currentInput && !currentInput.endsWith(' ')) {
          currentInput += ` ${getSymbol(buttonInteraction.customId)} `;
        } else {
          currentInput += getSymbol(buttonInteraction.customId);
        }
      }

      embed.setDescription(`\`\`\`${currentInput || '          '}\`\`\``);
      await interaction.editReply({ embeds: [embed] });

      if (!buttonInteraction.replied) {
        await buttonInteraction.deferUpdate();
      }
    });

    collector.on('end', (collected) => {
      interaction.followUp('Calculator session ended.');
    });
  },
};

function getSymbol(id) {
  switch (id) {
    case 'add':
      return '+';
    case 'subtract':
      return '-';
    case 'multiply':
      return '*';
    case 'divide':
      return '/';
    case 'pi':
      return Math.PI;
    case 'power':
      return '**';
    case 'percent':
      return '/100';
    case 'open-bracket':
      return '(';
    case 'close-bracket':
      return ')';
    default:
      return '';
  }
}

function evaluateExpression(input) {
  try {
    const expression = input
      .replace(/➕/g, '+')
      .replace(/➖/g, '-')
      .replace(/✖️/g, '*')
      .replace(/➗/g, '/')
      .replace(/π/g, Math.PI)
      .replace(/%/g, '/100');

    const result = eval(expression);
    return isFinite(result) ? result : 'Error';
  } catch (error) {
    return 'Error in calculation';
  }
}
