const { MessageEmbed } = require("discord.js");
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
      if(!auth.has(message.author.id)) {
        return message.reply('not authorized to change channels!')
      }

      if(!args[0]) {
        return message.reply('you must give me a channel').then(m => m.delete({timeout: 2500}))
      }
      if(!args[1]) {
        return message.reply('you must give me a channel description').then(m => m.delete({timeout: 2500}))
      }

      const myGuild = message.guild
      const _channel = myGuild.channels.cache.find(channel => channel.name === `${args[0]}`) || myGuild.channels.cache.find(channel => channel.id === `${args[0]}`) || message.mentions.channels.first()
      const topic = args.slice(1).join(" ")

      if(!_channel) {
        return message.reply('I could not find that channel!');
      }

      _channel.setTopic(topic, `Moderator: ${message.author.tag}`)
        .then(fulfilled => message.channel.send(":white_check_mark: I successfully updated the channel's topic1"))
        .catch(err => errorMessage(err, 'Nickname command', message, client));

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}

// JS
