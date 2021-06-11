const { responseEmbed, toConsole } = require("../../functions");
const cooldown = new Set();
const auth = new Set();
auth.add('669051415074832397')

module.exports = {
    name: "settopic",
    category: "channel management",
    description: "Sets the topic of a channel if a valid one is given",
    usage: '<channel> [topic]',
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add("669051415074832397")

      if(message.member.hasPermission("MANAGE_CHANNELS")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) responseEmbed(3, "Unauthorized: You don't have MANAGE CHANNELS", "CHANNEL", message, client)
      if(!message.guild.me.hasPermission("MANAGE_CHANNELS")) responseEmbed(3, "Unauthorized: I don't have MANAGE CHANNELS", "CHANNEL", message, client)

      if(!args[0]) responseEmbed(3, "Bad Usage: You must supply a channel", "CHANNEL", message, client)
      if(!args[1]) responseEmbed(3, "Bad Usage: You must supply a channel topic", "CHANNEL", message, client)

      const _channel = message.guild.channels.cache.find(channel => channel.name === `${args[0]}`)
      || message.guild.channels.cache.find(channel => channel.id === `${args[0]}`)
      || message.mentions.channels.first()
      const topic = args.slice(1).join(" ")

      if(!_channel) responseEmbed(3, "Not Found: I could not find a channel for " + args[0], "CHANNEL", message, client)

      _channel.setTopic(topic, `Moderator: ${message.author.tag}`)
        .then(channel => responseEmbed(1, "I updated the channel's topic to " + channel.topic, "CHANNEL", message, client))
        .catch(err => toConsole(err, 'nickname.js (Line 37)', message, client));

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}

// JS
