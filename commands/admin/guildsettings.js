const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GuildSettings } = require('../../models/Level');
const Welcome = require('../../models/welcome');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guildsettings')
    .setDescription('View the settings for the guild'),

  async execute(interaction) {
    const { guild } = interaction;
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content:
          'You do not have `Administrator` permission to manage the guild!',
        ephemeral: true,
      });
    }

    const guildSettings = await GuildSettings.findOne({ guildId: guild.id });
    if (!guildSettings) {
      return interaction.reply({
        content: 'Guild settings not found!',
        ephemeral: true,
      });
    }

    const welcomeSettings = await Welcome.findOne({ serverId: guild.id });

    const embed = new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle(`Guild Settings for ${guild.name}`)
      .setTimestamp();

    embed.addFields({
      name: '**Leveling Settings**',
      value: '\u200B',
      inline: false,
    });
    if (guildSettings.levelingEnabled) {
      embed.addFields(
        { name: 'Leveling', value: 'Enabled', inline: true },
        {
          name: 'XP Rate',
          value: `${guildSettings.xpRate}`,
          inline: true,
        },
        {
          name: 'Level Up Channel',
          value: guildSettings.levelUpChannelId
            ? `<#${guildSettings.levelUpChannelId}>`
            : 'Not set',
          inline: true,
        }
      );
    } else {
      embed.addFields({
        name: 'Leveling',
        value: 'Disabled',
        inline: true,
      });
    }

    embed.addFields({
      name: '**Welcome System Settings**',
      value: '\u200B',
      inline: false,
    });
    if (welcomeSettings && welcomeSettings.enabled) {
      embed.addFields(
        { name: 'Welcome System', value: 'Enabled', inline: true },
        {
          name: 'Welcome Channel',
          value: welcomeSettings.channelId
            ? `<#${welcomeSettings.channelId}>`
            : 'Not set',
          inline: true,
        }
      );
    } else {
      embed.addFields({
        name: 'Welcome System',
        value: 'Disabled',
        inline: true,
      });
    }

    return interaction.reply({ embeds: [embed] });
  },
};
