const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get the current weather for a location.')
    .addStringOption((option) =>
      option
        .setName('location')
        .setDescription('The location to get the weather for')
        .setRequired(true)
    ),
  async execute(interaction) {
    const location = interaction.options.getString('location');

    const apiKey = process.env.WEATHER_API;

    if (!apiKey) {
      return await interaction.reply('Weather API key is not configured.');
    }

    const weatherResponse = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}`
    );

    if (!weatherResponse.ok) {
      return await interaction.reply(
        'Could not fetch the weather. Please check the location and try again.'
      );
    }

    const data = await weatherResponse.json();

    if (data.error) {
      return await interaction.reply(
        'Could not find any location matching that name. Please try a different one.'
      );
    }

    const weatherEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(
        `Current Weather in ${data.location.name}, ${data.location.region}, ${data.location.country}`
      )
      .addFields(
        {
          name: 'Temperature',
          value: `${data.current.temp_c}°C`,
          inline: true,
        },
        {
          name: 'Condition',
          value: `${data.current.condition.text}`,
          inline: true,
        },
        {
          name: 'Windspeed',
          value: `${data.current.wind_kph} kph`,
          inline: true,
        },
        {
          name: 'Humidity',
          value: `${data.current.humidity}%`,
          inline: true,
        },
        {
          name: 'Local Time',
          value: `${data.location.localtime}`,
          inline: true,
        }
      )
      .setTimestamp()
      .setFooter({ text: 'Weather data provided by WeatherAPI' });

    await interaction.reply({ embeds: [weatherEmbed] });
  },
};
