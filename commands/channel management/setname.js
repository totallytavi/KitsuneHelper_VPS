const { MessageEmbed } = require("discord.js");
const { responseEmbed, toConsole } = require("../../functions");
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "setname",
    category: "channel management",
    description: "Sets the name of a given channel",
    usage: '<channel> <name>',
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add("409740404636909578")

      if(message.member.hasPermission("MANAGE_CHANNELS")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) return responseEmbed(3, "Unauthorized: You don't have MANAGE CHANNELS", "CHANNEL", message, client)
      if(!message.guild.me.hasPermission("MANAGE_CHANNELS")) return responseEmbed(3, "Unauthorized: I don't have MANAGE CHANNELS", "CHANNEL", message, client)

      if(!args[0]) return responseEmbed(3, "Bad Usage: You must supply a channel", "CHANNEL", message, client)
      if(!args[1]) return responseEmbed(3, "Bad Usage: You must supply a name", "CHANNEL", message, client)

      const _channel = message.guild.channels.cache.find(channel => channel.name === `${args[0]}`)
      || message.guild.channels.cache.get(`${args[0]}`)
      || message.mentions.channels.first();
      const name = args.slice(1).join(" ")

      _channel.setName(name, `Moderator: ${message.author.tag}`)
        .then(channel => responseEmbed(1, "I updated the channel's name to " + channel.name, "CHANNEL", message, client))
        .catch(err => toConsole(String(err), 'nickname.js (Line 35)', message, client));

      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}
