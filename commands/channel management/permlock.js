const { toConsole, responseEmbed } = require("../../functions");
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "permlock",
    aliases: ['pl'],
    category: "channel management",
    description: "Locks the permissions of the channel with the category",
    usage: '<channel>',
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
        auth.add(message.author.id);
      }
      if(!auth.has(message.author.id)) return responseEmbed(3, "Unauthorized: You don't have MANAGE CHANNELS", "CHANNEL", message, client)
      if(!message.guild.me.hasPermission("MANAGE_CHANNELS")) return responseEmbed(3, "Unauthorized: I don't have MANAGE CHANNELS", "CHANNEL", message, client)

      if(!args[0]) return responseEmbed(3, "Bad Usage: You must supply a channel", "CHANNEL", message, client)

      const toPL = message.guild.channels.cache.find(channel => channel.id === `${args[0]}`)
      || message.guild.channels.cache.find(channel => channel.name === `${args[0]}`)
      || message.mentions.channels.first()

      if(!toPL) return responseEmbed(3, "Not Found: No channel found for " + toPL, "CHANNEL", message, client)

      toPL.lockPermissions(true, `Moderator: ${message.author.tag} (ID: ${message.author.id})`)
        .then(responseEmbed(1, "I synced the permissions of \`" + toPL.name + "\` with the category", "CHANNEL", message, client))
        .catch(err => toConsole(String(err), 'permlock.js (Line 35)', message, client));

      auth.delete(message.author.id);
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}
