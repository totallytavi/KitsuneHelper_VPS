const { MessageEmbed } = require("discord.js");
const { errorMessage } = require('../../functions.js');
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
      if(!auth.has(message.author.id)) {
        return message.reply('kitsune leadership has not authorized you to do that!').then(m => m.delete({timeout: 5000}))
      }
      if(!message.guild.me.hasPermission("MANAGE_CHANNELS") && !message.channel.permissions.has("MANAGE_CHANNELS")) {
        return message.reply('I have not been allowed to MANAGE_CHANNELS. Please check my role has permissions to do so')
      }

      let slowmode = parseInt(args[1])
      if(!slowmode) {
        return message.reply('you did not specify a slowmode time')
      }
      if(slowmode < 0) {
        return message.reply('slowmode is not a valid number!')
      }
      let _channel = message.guild.channels.cache.find(c => c.id === `${args[0]}`) || message.guild.channels.cache.find(c => c.name === `${args[0]}`) || message.mentions.channels.first();
      if(!_channel) {
        return message.reply('I did not find that channel. Is this channel in your server? Try using an ID or mention')
      }
      if(_channel.type != "text") {
        return message.reply(`I cannot modify channel slowmode on ${_channel.type} channel`)
      }
      if(!_channel.manageable) {
        return message.reply('I cannot manage this channel')
      }

      _channel.setRateLimitPerUser(slowmode, `Moderator: ${message.author.tag}`)
      .then(channel => message.channel.send(`Updated! Channel slowmode is ${channel.rateLimitPerUser} seconds`))
      .catch(e => errorMessage(e, 'Slowmode command', message, client));

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}