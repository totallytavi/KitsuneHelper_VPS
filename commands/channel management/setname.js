const { MessageEmbed } = require("discord.js");
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "setname",
    category: "channel management",
    description: "Sets the name of a given channel",
    usage: '<channel> <name>',
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
        return message.reply("you are not allowed to modify channels").then(m => m.delete({timeout: 2500}))
      }

      if(!args[0]) {
        return message.reply('please give me a channel!').then(m => m.delete({timeout: 2500}))
      }
      if(!args[1]) {
        return message.reply('please give me a name!').then(m => m.delete({timeout: 2500}))
      }

      const myGuild = message.guild;
      const _channel = myGuild.channels.cache.find(channel => channel.name === `${args[0]}`) || myGuild.channels.cache.find(channel => channel.id === `${args[0]}`) || message.mentions.channels.first();
      const name = args.slice(1).join(" ")

      _channel.setName(name, `Moderator: ${message.author.tag}`)
        .then(fulfilled => message.channel.send(`:white_check_mark: I updated the channel!`))
        .catch(err => errorMessage(err, 'Nickname command', message, client));

      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}
