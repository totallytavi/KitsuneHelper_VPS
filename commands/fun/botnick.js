const { MessageEmbed } = require("discord.js");
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
      if(!auth.has(message.author.id)) {
        return message.reply('kitsune leadership has not authorized you to do that!').then(m => m.delete({timeout: 5000}))
      }
      if(!message.guild.me.hasPermission("CHANGE_NICKNAME")) {
        return message.reply('I have not been allowed to change my nickname. Please check my role has permissions to do so')
      }

      var nickname = args.slice(0).join(" ")
      if(!nickname) {
        nickname = "Kitsune Helper"
      }

      const embed = new MessageEmbed()
      .setTitle('Nickname Update')
      .addFields(
        { name: 'Moderator', value: message.author, inline: true },
        { name: 'Target', value: client.user, inline: true },
        { name: 'Nickname', value: nickname, inline: true }
      )
      .setTimestamp();

      message.guild.me.setNickname(nickname, `Moderator: ${message.author.tag}`)
        .then(fulfilled => message.channel.send(`Updated!`, embed))
        .catch(err => errorMessage(err, 'Nickname command', message, client));;

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}
