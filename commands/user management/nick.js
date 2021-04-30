const { MessageEmbed } = require("discord.js");
const { errorMessage, errorEmbed } = require("../../functions");
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
      auth.add('669051415074832397');

      if(message.member.hasPermission("MANAGE_NICKNAMES")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) {
        return message.reply('kitsune leadership has not authorized you to do that!').then(m => m.delete({timeout: 2500}))
      }
      if(!message.guild.me.hasPermission("MANAGE_NICKNAMES")) {
        const response = await errorEmbed("Insufficient permissions: I cannot manage nicknames", message)
        return message.reply(response)
      }

      var target = message.mentions.members.first() || await message.guild.members.fetch(`${args[0]}`).then(gM => target = gM)
      if(!target) {
        return errorMessage("Unknwon guild member", "Nickname command", message, client)
      }
      if(!target.manageable) {
        return message.reply('I cannot manage this user!').then(m => m.delete({timeout: 2500}));
      }

      var nickname = args.slice(1).join(" ")
      if(!nickname) {
        nickname = target.user.tag.slice(0, -5);
      }
      if(nickname.length >= 33) {
        return errorEmbed("Nickname is too long (Limit: 32)", message)
      }

      const embed = new MessageEmbed()
      .setTitle('Nickname Update')
      .addFields(
        { name: 'Moderator', value: message.author, inline: true },
        { name: 'Target', value: target, inline: true },
        { name: 'Nickname', value: nickname, inline: true }
      )
      .setTimestamp();

      if(target === message.member) {
        if(!message.member.hasPermission("CHANGE_NICKNAME")) {
          const response = await errorEmbed("Unauthorized: You do not have CHANGE NICKNAME", message)
          return message.reply(response)
        }
        target.setNickname(nickname)
          .then(member => message.reply(`I updated your nickname to ${member.nickname}`))
          .catch(err => errorMessage(err, 'Nickname command', message, client));
      }

      target.setNickname(nickname, `Moderator: ${message.author.tag}`)
        .then(member => message.channel.send(`Updated ${member}'s nickname to ${nickname}!`, embed))
        .catch(err => errorMessage(err, 'Nickname command', message, client));

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}
