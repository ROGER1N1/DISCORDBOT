const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pp')
    .setDescription(
      'Generates a random pp size representation with a compliment.'
    ),

  async execute(interaction) {
    const sizes = {
      small: {
        representation: '8==D',
        compliments: [
          'Looks cute!',
          'Is that even a size?',
          "A little shy, aren't we?",
          'Every little bit counts!',
          'Perfect for the pocket!',
          'Great things come in small packages!',
          'Small but mighty!',
          'Easy to handle!',
          "You're all about finesse!",
          "It's a thoughtful size!",
        ],
      },
      medium: {
        representation: '8===D',
        compliments: [
          'Not bad at all!',
          "That's decent!",
          'Could use a bit more, but still good!',
          'Just the right balance!',
          'A solid choice!',
          'Good for everyday use!',
          'Comfortably sized!',
          'Fits the bill perfectly!',
          'You know how to keep it reasonable!',
          "That's a nice, sensible size!",
        ],
      },
      average: {
        representation: '8====D',
        compliments: [
          'Pretty average!',
          "Just what you'd expect!",
          'Satisfactory, but nothing to brag about!',
          'A reliable performer!',
          'A safe bet!',
          'Comfortably normal!',
          'Nothing wrong with being average!',
          "You're keeping it real!",
          'That size is just right!',
          'A well-rounded choice!',
        ],
      },
      large: {
        representation: '8=====D',
        compliments: [
          "Now that's impressive!",
          "You've got something to show!",
          'Very nice size!',
          "It's a crowd-pleaser!",
          'Great for some fun!',
          'Definitely stands out!',
          "You're making waves!",
          'That size is hard to ignore!',
          'You know how to draw attention!',
          "That's a significant upgrade!",
        ],
      },
      huge: {
        representation: '8======D',
        compliments: [
          'Wow, quite impressive!',
          "That's a bold statement!",
          'You know how to make an impression!',
          'Not for the faint-hearted!',
          'A real showstopper!',
          'You mean business!',
          "That's a game changer!",
          "You've got some serious confidence!",
          "You're raising the bar!",
          'That size has presence!',
        ],
      },
      extraLarge: {
        representation: '8=======D',
        compliments: [
          "That's massive!",
          "You've got some confidence!",
          'What a sight to behold!',
          'A true masterpiece!',
          "It's hard to ignore!",
          'An absolute unit!',
          "You're in a league of your own!",
          "You've really outdone yourself!",
          "That's a bold choice!",
          'Expecting a standing ovation!',
        ],
      },
      massive: {
        representation: '8========D',
        compliments: [
          'Truly a sight to see!',
          "You're a show-off!",
          "That's just extra!",
          'Ready to take on the world!',
          "You've outdone yourself!",
          "That's impressive, no question!",
          "You're going for gold!",
          'That size is simply monumental!',
          "You don't play small!",
          'Expect some serious attention!',
        ],
      },
      legendary: {
        representation: '8=========D',
        compliments: [
          'A legendary size!',
          'Unbelievable!',
          "That's a myth in the making!",
          'Epic proportions!',
          "You've reached the pinnacle!",
          'A true legend!',
          "You're the stuff of legends!",
          'That size is practically mythical!',
          "You're rewriting the book on size!",
          'Absolutely iconic!',
        ],
      },
    };

    const sizeKeys = Object.keys(sizes);
    const selectedSize = sizeKeys[Math.floor(Math.random() * sizeKeys.length)];
    const { representation, compliments } = sizes[selectedSize];

    const randomCompliment =
      compliments[Math.floor(Math.random() * compliments.length)];

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('pp Size Generator')
      .addFields(
        { name: 'pp Size:', value: representation, inline: true },
        {
          name: 'Size Category:',
          value: selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1),
          inline: true,
        },
        { name: 'Compliment:', value: randomCompliment, inline: false }
      )
      .setFooter({
        text: 'Enjoy the fun!',
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
