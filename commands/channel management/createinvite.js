const { MessageEmbed } = require("discord.js");
const cooldown = new Set();
const auth = new Set();
let _channel;

module.exports = {
    name: "createinvite",
    aliases: ['ci','createinv'],
    category: "channel management",
    description: "Creates an invite for the given channel",
    usage: '[channel] [true|false] [time in hours for the invite to last] [max uses]',
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add("669051415074832397")

      if(message.member.hasPermission("CREATE_INSTANT_INVITE")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) {
        return message.reply('you\'re not allowed to make invites!')
      }
      if(!message.guild.me.hasPermission("CREATE_INSTANT_INVITE")) {
        return message.reply('I have not been allowed to create invites. Please check my role has permissions to do so')
      }

      _channel = message.guild.channels.cache.find(channel => channel.name === `${args[0]}`) || message.guild.channels.cache.find(channel => channel.name === `${args[0]}`) || message.mentions.channels.first() || message.channel;
      const isTemp = args[1]
      const time = args[2]
      const maxUsers = args[3]

      trueTime = time * 3600

      _channel.createInvite({
        temporary: isTemp,
        maxAge: trueTime,
        maxUses: maxUsers
      })
        .then(invite => message.reply(`I created the invite: ${invite}`))
        .catch(err => errorMessage(err, 'Nickname command', message, client));

      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}

// JS
