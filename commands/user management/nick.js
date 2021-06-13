const { MessageEmbed } = require("discord.js");
const { errorMessage, errorEmbed, responseEmbed, toConsole } = require("../../functions");
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "nick",
    aliases: ['nickname'],
    category: "user management",
    description: "Sets the nickname of a user or resets it (If no nickname is given), NOT THE BOT",
    usage: '<user> [nickname]',
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add('409740404636909578');

      if(message.member.hasPermission("MANAGE_NICKNAMES")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) return responseEmbed(3, "Unauthorized: You don't have MANAGE NICKNAMES", "CHANNEL", message, client)
      if(!message.guild.me.hasPermission("MANAGE_NICKNAMES")) return responseEmbed(3, "Unauthorized: You don't have MANAGE NICKNAMES", "CHANNEL", message, client)

      if(!args[0]) return responseEmbed(3, "Bad Usage: You must supply a user", "CHANNEL", message, client)
      if(!args[1]) return responseEmbed(3, "Bad Usage: You must supply a nickname", "CHANNEL", message, client)

      var target = message.mentions.members.first()
      || message.guild.members.cache.get(`${args[0]}`)
      if(!target) return responseEmbed(3, "Not Found: I couldn't find anything for " + args[0], "CHANNEL", message, client)
      if(!target.manageable) return responseEmbed(3, "Unauthorized: I cannot manage that user", "CHANNEL", message, client)

      var nickname = args.slice(1).join(" ")
      if(!nickname) {
        nickname = target.user.tag.slice(0, -5);
      }
      if(nickname.length >= 33) return responseEmbed(3, "Bad Usage: That nickname is too long", "CHANNEL", message, client)

      const embed = new MessageEmbed()
      .setTitle('Nickname Update')
      .addFields(
        { name: 'Moderator', value: message.author, inline: true },
        { name: 'Target', value: target, inline: true },
        { name: 'Nickname', value: nickname, inline: true }
      )
      .setTimestamp();

      target.setNickname(nickname, `Moderator: ${message.author.tag}`)
        .then(member => responseEmbed(1, `I updated ${target}'s (${target.user.id}) nickname to ${member.nickname}`, "CHANNEL", message, client))
        .catch(err => toConsole(err, 'nick.js (Line 51)', message, client));

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}
