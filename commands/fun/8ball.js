const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const responses = [
  'Yes.',
  'No.',
  'Ask again later.',
  'Definitely.',
  'Maybe.',
  'Absolutely not.',
  'Absolutely!',
  'I wouldn’t count on it.',
  'It’s certain.',
  'Very doubtful.',
  'Yes, in due time.',
  'No way!',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the Magic 8 Ball a question.')
    .addStringOption((option) =>
      option
        .setName('question')
        .setDescription('Your question for the Magic 8 Ball')
        .setRequired(true)
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const response = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🔮 Magic 8 Ball')
      .setDescription(`You asked: **${question}**`)
      .addFields(
        { name: 'Response', value: response, inline: true },
        {
          name: 'Requested by',
          value: `${interaction.user.tag}`,
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
