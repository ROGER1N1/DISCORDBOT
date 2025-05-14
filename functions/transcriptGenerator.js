const { AttachmentBuilder } = require('discord.js');
const dayjs = require('dayjs');

class TranscriptGenerator {
  static async generateTranscript(channel, closer) {
    const messages = await channel.messages.fetch({ limit: 100 });
    let transcript = `Transcript for #${channel.name}\n`;
    transcript += `Generated on ${new Date().toLocaleString()}\n`;
    transcript += `----------------------------------------\n\n`;

    const attachmentsToSend = [];

    for (const msg of [...messages.values()].reverse()) {
      try {
        const timestamp = new Date(msg.createdAt).toLocaleString();
        const author = msg.member?.displayName || msg.author.username;

        let content = msg.content;

        content = await this.replaceAsync(
          content,
          /<@!?(\d+)>/g,
          async (match, id) => {
            const user = await channel.client.users.fetch(id).catch(() => null);
            return user ? `@${user.username}` : '@Unknown User';
          }
        );

        content = await this.replaceAsync(
          content,
          /<@&(\d+)>/g,
          async (match, id) => {
            const role = await channel.guild.roles.fetch(id).catch(() => null);
            return role ? `@${role.name}` : '@deleted-role';
          }
        );

        content = content.replace(/<#(\d+)>/g, (match, id) => {
          const mentionedChannel = channel.client.channels.cache.get(id);
          return mentionedChannel
            ? `#${mentionedChannel.name}`
            : '#deleted-channel';
        });

        content = content.replace(
          /<t:(\d+):([tTdDfFR])?>/g,
          (match, timestamp, format) => {
            const date = new Date(timestamp * 1000);
            return dayjs(date).format('MMM D, YYYY h:mm A');
          }
        );

        content = content.replace(/@(everyone|here)/g, '@$1');

        content = content.replace(/<a?:(\w+):(\d+)>/g, ':$1:');

        transcript += `[${timestamp}] ${author}: ${content}\n`;

        if (msg.attachments.size) {
          msg.attachments.forEach((attachment) => {
            const attachmentBuilder = new AttachmentBuilder(attachment.url, {
              name: attachment.name,
            });
            attachmentsToSend.push(attachmentBuilder);
            transcript += `[Attachment: ${attachment.name}]\n`;
          });
        }

        if (msg.embeds.length) {
          for (const embed of msg.embeds) {
            const embedText = await this.formatEmbed(embed, channel);
            transcript += embedText;
          }
        }

        transcript += '\n';
      } catch (error) {
        console.error(`Error processing message ${msg.id}:`, error);
        transcript += `[Error loading message]\n\n`;
      }
    }

    const transcriptFile = new AttachmentBuilder(
      Buffer.from(transcript, 'utf8'),
      {
        name: `transcript-${channel.name}-${Date.now()}.txt`,
      }
    );

    return {
      transcript: transcriptFile,
      attachments: attachmentsToSend,
    };
  }

  static async replaceAsync(str, regex, asyncFn) {
    const promises = [];
    str.replace(regex, (match, ...args) => {
      const promise = asyncFn(match, ...args);
      promises.push(promise);
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
  }

  static async formatContent(content, channel) {
    if (!content) return '';

    let formatted = content;

    formatted = await this.replaceAsync(
      formatted,
      /<@!?(\d+)>/g,
      async (match, id) => {
        const user = await channel.client.users.fetch(id).catch(() => null);
        return user ? `@${user.username}` : '@Unknown User';
      }
    );

    formatted = await this.replaceAsync(
      formatted,
      /<@&(\d+)>/g,
      async (match, id) => {
        const role = await channel.guild.roles.fetch(id).catch(() => null);
        return role ? `@${role.name}` : '@deleted-role';
      }
    );

    formatted = formatted
      .replace(/<#(\d+)>/g, (_, id) => {
        const mentionedChannel = channel.client.channels.cache.get(id);
        return mentionedChannel
          ? `#${mentionedChannel.name}`
          : '#deleted-channel';
      })
      .replace(/<t:(\d+):([tTdDfFR])?>/g, (_, timestamp) => {
        const date = new Date(timestamp * 1000);
        return dayjs(date).format('MMM D, YYYY h:mm A');
      })
      .replace(/@(everyone|here)/g, '@$1')
      .replace(/<a?:(\w+):(\d+)>/g, ':$1:');

    return formatted;
  }

  static async formatEmbed(embed, channel) {
    let embedText = '';

    if (embed.author) {
      embedText += `[Embed Author: ${embed.author.name}`;
      if (embed.author.iconURL) embedText += ` (Icon: ${embed.author.iconURL})`;
      embedText += ']\n';
    }

    if (embed.title) {
      const formattedTitle = await this.formatContent(embed.title, channel);
      embedText += embed.url
        ? `[Embed Title: ${formattedTitle} (URL: ${embed.url})]\n`
        : `[Embed Title: ${formattedTitle}]\n`;
    }

    if (embed.description) {
      const formattedDesc = await this.formatContent(
        embed.description,
        channel
      );
      embedText += `[Embed Description: ${formattedDesc}]\n`;
    }

    if (embed.fields?.length) {
      embedText += '[Embed Fields:]\n';
      for (const field of embed.fields) {
        const formattedName = await this.formatContent(field.name, channel);
        const formattedValue = await this.formatContent(field.value, channel);
        embedText += `  • ${formattedName}: ${formattedValue}\n`;
      }
    }

    if (embed.image) embedText += `[Embed Image: ${embed.image.url}]\n`;
    if (embed.thumbnail)
      embedText += `[Embed Thumbnail: ${embed.thumbnail.url}]\n`;

    if (embed.footer) {
      embedText += `[Embed Footer: ${embed.footer.text}`;
      if (embed.footer.iconURL) embedText += ` (Icon: ${embed.footer.iconURL})`;
      embedText += ']\n';
    }

    if (embed.color)
      embedText += `[Embed Color: #${embed.color.toString(16).padStart(6, '0')}]\n`;

    if (embed.timestamp) {
      const timestamp = new Date(embed.timestamp).toLocaleString();
      embedText += `[Embed Timestamp: ${timestamp}]\n`;
    }

    return embedText;
  }
}

module.exports = TranscriptGenerator;
