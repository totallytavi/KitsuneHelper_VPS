const { MessageEmbed } = require("discord.js");
const { responseEmbed, toConsole } = require("../../functions");
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "setnsfw",
    aliases: ['nsfw'],
    category: "channel management",
    description: "Sets/unsets the channel NSFW",
    usage: '<channel>',
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({timeout: 2500}));
      } else {
      auth.add("669051415074832397")

      if(message.member.hasPermission("MANAGE_CHANNELS")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) return responseEmbed(3, "Unauthorized: You don't have MANAGE CHANNELS", "CHANNEL", message, client)
      if(!message.guild.me.hasPermission("MANAGE_CHANNELS")) return responseEmbed(3, "Unauthorized: I don't have MANAGE CHANNELS", "CHANNEL", message, client)

      if(!args[0]) return responseEmbed(3, "Bad Usage: You must supply a channel", "CHANNEL", message, client)

      const myGuild = message.guild
      const toPL = myGuild.channels.cache.find(channel => channel.id === `${args[0]}`) || myGuild.channels.cache.find(channel => channel.name === `${args[0]}`) || message.mentions.channels.first()
      const value = args[1]

      if(!args[1]) return responseEmbed(3, "Bad Usage: You must supply a boolean", "CHANNEL", message, client)
      if(!toPL) return responseEmbed(3, "Not Found: Nothing found for " + args[0], "CHANNEL", message, client)

      toPL.setNSFW(value, `Moderator: ${message.author.tag}`)
        .then(channel => responseEmbed(1, "I updated the channel's NSFW setting to " + channel.nsfw, "CHANNEL", message, client))
        .catch(err => toConsole(err, 'setNSFW.js (Line 37)', message, client));

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}
