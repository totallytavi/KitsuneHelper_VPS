const { MessageEmbed } = require("discord.js");
const { responseEmbed, toConsole } = require("../../functions");
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "botnick",
    category: "fun",
    description: "Sets the nickname of the bot or resets it (If no nickname is given)",
    usage: '[nickname]',
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add('669051415074832397');

      if(message.member.hasPermission("MANAGE_NICKNAMES")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) responseEmbed(3, "Unauthorized: You don't have MANAGE NICKNAMES", "CHANNEL", message, client)
      if(!message.guild.me.hasPermission("CHANGE_NICKNAME")) responseEmbed(3, "Unauthorized: I cannot change my own nickname", "CHANNEL", message, client)

      var nickname = args.slice(0).join(" ")
      if(!nickname) {
        nickname = "Kitsune Helper"
      }

      message.guild.me.setNickname(nickname, `Moderator: ${message.author.tag}`)
        .then(member => responseEmbed(1, "I set my nickname to " + member.nickname))
        .catch(err => toConsole(err, 'nickname.js (Line 32)', message, client));

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}
