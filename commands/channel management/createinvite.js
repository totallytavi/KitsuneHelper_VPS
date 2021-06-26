const { responseEmbed, toConsole } = require("../../functions");
const cooldown = new Set();
const auth = new Set();

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
      auth.add("409740404636909578")

      if(message.member.hasPermission("CREATE_INSTANT_INVITE")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) return responseEmbed(3, "Unauthorized: You don't have CREATE INVITES", "CHANNEL", message, client)
      if(!message.guild.me.hasPermission("CREATE_INSTANT_INVITE")) return responseEmbed(3, "Unauthorized: I don't have CREATE INVITES", "CHANNEL", message, client)

      let _channel = message.guild.channels.cache.find(channel => channel.name === `${args[0]}`)
      || message.guild.channels.cache.find(channel => channel.name === `${args[0]}`)
      || message.mentions.channels.first()
      || message.channel;

      _channel.createInvite({
        temporary: args[1],
        maxAge: args[2] * 3600,
        maxUses: args[3]
      })
      .then(invite => responseEmbed(1, "I created an invite! " + invite, "CHANNEL", message, client))
      .catch(err => toConsole(String(err), 'createinvite.js (Line 32)', message, client));

      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}