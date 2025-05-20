const axios = require('axios');
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstatus')
    .setDescription('Get the status of a Minecraft server.')
    .addStringOption((option) =>
      option
        .setName('serverip')
        .setDescription('The IP address of the Minecraft server.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('gamemode')
        .setDescription('The game mode of the server (Java or Bedrock).')
        .setRequired(true)
        .addChoices(
          { name: 'Java', value: 'java' },
          { name: 'Bedrock', value: 'bedrock' }
        )
    ),

  async execute(interaction) {
    const serverIp = interaction.options.getString('serverip');
    const gameMode = interaction.options.getString('gamemode');

    const apiUrl =
      gameMode === 'java'
        ? `https://api.mcsrvstat.us/1/${serverIp}`
        : `https://api.mcsrvstat.us/bedrock/1/${serverIp}`;

    try {
      const { data } = await axios.get(apiUrl);

      if (data.offline) {
        const offlineEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle(`❌ Server Offline`)
          .setDescription(`The server at \`${serverIp}\` is currently offline.`)
          .addFields(
            {
              name: '🖥 IP Address',
              value: `↳ \`${serverIp}\``,
              inline: true,
            },
            {
              name: '🛜 Port',
              value: `↳ \`${data.port || 'Unknown'}\``,
              inline: true,
            }
          )
          .setFooter({ text: 'Last updated' })
          .setTimestamp();

        return interaction.reply({ embeds: [offlineEmbed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#008080')
        .setTitle(`${serverIp}`)
        .setDescription('**Server Online** 🟢')
        .addFields(
          {
            name: '🖥 IP Address',
            value: `↳ \`${data.ip}\``,
            inline: true,
          },
          {
            name: '🛜 Port',
            value: `↳ \`${data.port}\``,
            inline: true,
          },
          {
            name: '🗺 Hostname',
            value: '↳ `' + data.hostname + '`' || 'Unknown',
            inline: false,
          },
          {
            name: '📊 Players Online',
            value: `↳ \`${data.players?.online || 0}\` / **${data.players?.max || 0}**`,
            inline: false,
          },
          {
            name: '🔧 Version',
            value: '↳ **' + data.version + '**' || 'Unknown',
            inline: false,
          },
          {
            name: '🌅 MOTD',
            value: `\`\`\`ansi\n\x1b[36m${data.motd?.clean[0]?.trim() || ''}\n${
              data.motd?.clean[1]?.trim() || ''
            }\x1b[0m\`\`\``,
          }
        )
        .setFooter({ text: 'Last updated' })
        .setTimestamp()
        .setThumbnail(`https://api.mcstatus.io/v2/icon/${serverIp}`);

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply(
        `There was an error fetching the status for ${serverIp}.`
      );
    }
  },
};
