const { MessageEmbed } = require("discord.js");
const { errorMessage } = require("../../functions");
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "deletechannel",
    aliases: ["delchannel"],
    category: "channel management",
    description: "Deletes a given channel",
    usage: "<channel>",
    cooldown: "5 seconds",
    run: async (client, message, args) => {
      if(message.deletable) {
        message.delete()
      }
      if(cooldown.has(message.author.id)) {
        return message.reply("that's a little too quick!").then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add("669051415074832397")

      if(message.member.hasPermission("MANAGE_CHANNELS")) {
        auth.add(message.author.id);
      }
      if(!auth.has(message.author.id)) {
        return message.reply('you are not authorized to delete channels!').then(m => m.delete({timeout: 2500}));
      }
      if(!message.guild.me.hasPermission("MANAGE_CHANNELS") && !message.channel.permissions.has("MANAGE_CHANNELS")) {
        return message.reply('I have not been allowed to delete channels').then(m => m.delete({timeout: 2500}));
      }

      if(!args[0]) {
        return message.reply('you must provide me with a channel!')
      }

      const toDelete = message.guild.channels.cache.find(channel => channel.id === `${args[0]}`) || message.guild.channels.cache.find(channel => channel.name === `${args.slice(0).join(" ")}`) || message.mentions.channels.first();

      if(!toDelete) {
        return message.reply("I couldn't find that channel, please try again").then(m => m.delete({timeout: 2500}));
      }

      toDelete.delete({ reason: `Moderator: ${message.author.tag}` })
        .then(message.channel.send(':white_check_mark: The channel was deleted!'))
        .catch(e => errorMessage(e, "delchannel command", message, client))

      auth.delete(message.author.id);
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000)
    }
  }
}
