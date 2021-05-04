const { MessageEmbed } = require("discord.js");
const { errorMessage, errorEmbed } = require('../../functions.js');
const fetch = require('node-fetch');
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

      if(typeof parseInt(args[0]) != "number") {
        const response = await errorEmbed("Bad usage: Invalid parameters given (Limit is not a number)", message)
        return message.reply(response)
      }
      if(args[0] < 1 || args[0] > 10) {
        const response = await errorEmbed("Bad usage: Invalid parameters given (Number is not within 1 and 10)", message)
        return message.reply(response)
      }
      if(typeof args[1] != "string") {
        const response = await errorEmbed("Bad usage: Invalid parameters given (Tags are not a string)", message)
        return message.reply(response)
      }
      if(args[2]) {
        if(typeof args[2] != "string") {
          const response = await errorEmbed("Bad usage: Invalid parameters given (Tags are not a string)", message)
          return message.reply(response)
        }
      }
      if(args[3]) {
        const response = await errorEmbed("Usage warning: I cannot query more than 2 tags at once. Images will show with the first two tags only", message)
        await message.reply(response)
      }
      if(message.channel.nsfw != "true") {
        const response = await errorEmbed("Usage warning: Due to this channel not being marked as NSFW, I will filter out any posts marked as Explicit or Questionable. This may result in fewer posts", message)
        await message.reply(response)
      }
      var url = ""
      if(message.channel.nsfw != "true") {
        url = "https://CoderTavi:o7YZcCmpiHPZXY6Nm8TDxhjZ@danbooru.donmai.us/posts.json?tag=" + args.slice(1,2).join("+") + "&limit=" + args[0] + "&random=true" + "&rating=safe"
      } else {
        url = "https://CoderTavi:o7YZcCmpiHPZXY6Nm8TDxhjZ@danbooru.donmai.us/posts.json?tag=" + args.slice(1,2).join("+") + "&limit=" + args[0] + "&random=true"
      }

      fetch(url)
        .then(res => res.json())
        .then(json => {
          json.forEach(post => {
            if(post.rating === "s") {
              const rating = "Safe"
            } else if(post.rating === "q") {
              const rating = "Questionable"
            } else if(post.rating === "e") {
              const rating = "Explicit"
            } else {
              const rating = "Unknown"
            }
            const embed = new MessageEmbed()
            .setTitle(args.slice(1,2).join(" and "))
            .setAuthor("Artist(s): " + post.tag_string_artist)
            .setDescription("Score: " + post.score + " | Rating: " + rating)
            .setImage(post.large_file_url || post.file_url)
            .setFooter(post.tag_string_general + "| Posted on")
            .setTimestamp(post.created_at)

            message.channel.send(embed)
          })
        })

      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}