const { MessageEmbed } = require("discord.js");
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
      auth.add("669051415074832397")

      if(message.member.hasPermission("MANAGE_CHANNELS")) {
        auth.add(message.author.id);
      }
      if(!auth.has(message.author.id)) {
        return message.reply('you are not allowed to manage channels').then(m => m.delete({timeout: 2500}));
      }

      if(!message.guild.me.hasPermission("MANAGE_CHANNELS") && !message.channel.permissions.has("MANAGE_CHANNELS")) {
        return message.reply('I cannot change channel permissions').then(m => m.delete({timeout: 2500}))
      }

      if(!args[0]) {
        return message.reply('you must provide me a channel').then(m => m.delete({timeout: 2500}))
      }

      const myGuild = message.guild
      const toPL = myGuild.channels.cache.find(channel => channel.id === `${args[0]}`) || myGuild.channels.cache.find(channel => channel.name === `${args[0]}`) || message.mentions.channels.first()

      if(!toPL) {
        return message.reply('I couldn\'t find that channel, please try again').then(m => m.delete({timeout: 2500}))
      }

      toPL.lockPermissions(true, `Moderator: ${message.author.tag} (ID: ${message.author.id})`)
        .then(fulfilled => message.channel.send(`:white_check_mark: I updated the channel's permissions!`))
        .catch(err => errorMessage(err, 'Nickname command', message, client));

      auth.delete(message.author.id);
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}
