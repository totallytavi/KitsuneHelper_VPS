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
      if(message.channel.nsfw != true) {
        const response = await errorEmbed("Usage warning: Due to this channel not being marked as NSFW, I will filter out any posts marked as Explicit or Questionable. This may result in fewer posts", message)
        await message.reply(response)
      }
      var url = ""
      if(message.channel.nsfw != true) {
        url = "https://danbooru.donmai.us/posts.json?tags=" + args.slice(1,3).join("+") + "&limit=" + args[0] + "&random=true" + "&rating=s" + "&api_key=o7YZcCmpiHPZXY6Nm8TDxhjZ&login=Coder_Tavi"
      } else {
        url = "https://danbooru.donmai.us/posts.json?tags=" + args.slice(1,3).join("+") + "&limit=" + args[0] + "&random=true" + "&api_key=o7YZcCmpiHPZXY6Nm8TDxhjZ&login=Coder_Tavi"
      }
      console.log("The URL being used is: " + url)

      await fetch(url)
        .then(res => res.json())
        .then(posts => {
          for(post in posts) {
            var rating;
            if(posts[post].rating === "s") {
              rating = "Safe"
            } else if(posts[post].rating === "q") {
              rating = "Questionable"
            } else if(posts[post].rating === "e") {
              rating = "Explicit"
            } else {
              rating = "Unknown"
            }

            if(rating != "Safe" && message.channel.nsfw != true) continue; // I CAN FINALLY USE CONTINUE HELL YES
            if(posts[post].tag_string_artist.split(" ").includes("banned")) continue; // Banned artists
            if(posts[post].tag_string.split(" ").includes("loli")) continue; // Lolis
            
            const embed = new MessageEmbed()
            .setTitle(args.slice(1,3).join(" and "))
            .setAuthor("Artist(s): " + posts[post].tag_string_artist)
            .setDescription("Score: " + posts[post].score + " | Rating: " + rating + " | ID: " + posts[post].id)
            .setImage(posts[post].large_file_url || posts[post].file_url || posts[post].preview_file_url)
            .setFooter("Tags: " + posts[post].tag_string.split(" ").join(", ") + " | Posted on")
            .setTimestamp(posts[post].created_at)

            message.channel.send(embed)
          }
        })

      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}