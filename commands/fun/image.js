const { MessageEmbed } = require("discord.js");
const { KSoftClient } = require('@ksoft/api');
const { responseEmbed, toConsole } = require("../../functions");
const cooldown = new Set();
const ksoft = new KSoftClient('108ef0b57311a44f3f9593996a2c2eaf8a87cff3');

module.exports = {
    name: "image",
    category: "fun",
    description: "Get a random image from the KSoft.Si Image API based on your search term",
    usage: '<search term> [nsfw (true|false)]',
    timeout: "3 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {

      const oldQuery = `${args[0]}`
      const oldIsNSFW = `${args[1]}`
      const query = oldQuery.toLowerCase();
      const isNSFW = oldIsNSFW.toLowerCase();

      if(args[1] === `true`) {
        if(message.channel.nsfw === false) responseEmbed(3, "Unauthorized: You cannot query an NSFW image in a non-NSFW channel", "CHANNEL", message, client);
      }

      if(!query) responseEmbed(3, "Bad usage: You must specify a tag", "CHANNEL", message, client)
      if(!isNSFW) isNSFW === "false"

      try {
        const { url } = await ksoft.images.random(query, { nsfw: isNSFW })

        const embed = new MessageEmbed()
        .setTitle(query)
        .setDescription(`Searched tag: ${query} [-] Powered by KSoft.Si`)
        .setImage(url)
        .setFooter(`${message.author.tag} requested this!`, message.author.displayAvatarURL())
        .setTimestamp();

        if(!url) return;

        message.channel.send(embed)
      } catch(err) {
        toConsole(err, "image.js (Lines 34-45)", message, client)
      }

      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 3000);
    }
  }
}
