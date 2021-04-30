const { MessageEmbed } = require("discord.js");
const { errorMessage, errorEmbed } = require('../../functions.js');
const { fetch } = require('node-fetch');
const cooldown = new Set();

module.exports = {
    name: "danbooru",
    aliases: ['dbr','danb'],
    category: "fun",
    description: "Queries an image on the Danbooru Image API",
    usage: '<1-10> <tag(s)>',
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {

      const res = errorEmbed("Construction: Pending an API key, this command has been void", message)
      return message.reply(res)

      if(typeof args[0] != "number") {
        const response = errorEmbed("Bad usage: Invalid parameters given (Limit is not a number)", message)
        return message.reply(response)
      }
      if(typeof args.slice(1, 2) != "string") {
        const response = errorEmbed("Bad usage: Invalid parameters given (Tags are not a string)", message)
        return message.reply(response)
      }
      if(args[3]) {
        const response = errorEmbed("Usage Warning: I cannot query more than 2 tags at once. Images will show with the first two tags only", message)
        await message.reply(response)
      }
      if(channel.nsfw != "true") {
        const response = errorEmbed("Usage Warning: Due to this channel not being marked as NSFW, I will filter out any posts marked as Explicit or Questionable. This may result in fewer posts", message)
        await message.reply(response)
      }

      // fetch("https://CoderTavi:")

      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}