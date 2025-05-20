const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Fetches a random meme from r/memes'),

  async execute(interaction) {
    try {
      const response = await fetch('https://meme-api.com/gimme/memes');
      const json = await response.json();

      if (json && json.url) {
        const meme = {
          title: json.title,
          url: json.url,
          postLink: json.postLink,
          subreddit: json.subreddit,
          author: json.author,
          ups: json.ups,
        };

        const embed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle(meme.title)
          .setURL(meme.postLink)
          .setImage(meme.url)
          .setFooter({
            text: `Meme from r/${meme.subreddit} | Posted by ${meme.author} | Upvotes: ${meme.ups}`,
          });

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply("Sorry, I couldn't find a meme right now.");
      }
    } catch (error) {
      console.error('Error fetching meme:', error);
      await interaction.reply(
        'There was an error trying to fetch a meme. Please try again later.'
      );
    }
  },
};
