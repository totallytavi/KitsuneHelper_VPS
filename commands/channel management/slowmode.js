const { responseEmbed, toConsole } = require('../../functions.js');
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "slowmode",
    aliases: ['slowdown'],
    category: "channel management",
    description: "Sets the slowmode of a channel",
    usage: '<channel> <slowmode>',
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add('669051415074832397');

      if(message.member.hasPermission("MANAGE_CHANNELS")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) responseEmbed(3, "Unauthorized: You don't have MANAGE CHANNEL", "CHANNEL", message, client)
      if(!message.guild.me.hasPermission("MANAGE_CHANNELS")) responseEmbed(3, "Unauthorized: I don't have MANAGE CHANNEL", "CHANNEL", message, client) 

      let slowmode = parseInt(args[1])
      if(!slowmode) {
        return message.reply('you did not specify a slowmode time')
      }
      if(slowmode < 0) {
        return message.reply('slowmode is not a valid number!')
      }
      let _channel = message.guild.channels.cache.find(c => c.id === `${args[0]}`)
      || message.guild.channels.cache.find(c => c.name === `${args[0]}`)
      || message.mentions.channels.first();
      if(!_channel) responseEmbed(3, "Not Found: I couldn't find anything for " + args[0], "CHANNEL", message, client)
      if(!_channel.manageable) responseEmbed(3, "Unauthorized: I cannot manage that channel", "CHANNEL", message, client)

      _channel.setRateLimitPerUser(slowmode, `Moderator: ${message.author.tag}`)
      .then(channel => responseEmbed(1, "I updated the slowmode to " + channel.rateLimitPerUser + " seconds", "CHANNEL", message, client))
      .catch(e => toConsole(e, 'slowmode.js (Line 40)', message, client));

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}