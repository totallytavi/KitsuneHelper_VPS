const { MessageEmbed, Collection } = require("discord.js");
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "nuke",
    aliases: ['kaboom','obliterate','destroy'],
    category: "channel management",
    description: "Nukes a channel, clearing all messages",
    usage: '[channel]',
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add('669051415074832397');

      if(message.member.hasPermission("MANAGE_CHANNELS")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) {
        return message.reply('kitsune leadership has not authorized you to do that!').then(m => m.delete({timeout: 5000}))
      }
      if(!message.guild.me.hasPermission("MANAGE_CHANNELS") && !message.channel.permissions.has("MANAGE_CHANNELS")) {
        return message.reply('I have not been allowed to manage channels. Please check my role has permissions to do so')
      }

      const toNuke = message.guild.channels.cache.find(channel => channel.name === `${args.slice(0).join(" ")}`) || message.guild.channels.cache.find(channel => channel.id === `${args[0]}`) || message.mentions.channels.first() || message.channel

      if(!toNuke.manageable) {
        return message.reply('I am not allowed to manage that channel!')
      }
      if(!toNuke.type === "text") {
        return message.reply(`I cannot nuke non-text channels; the selected channel is a ${toNuke.type} channel`)
      }

      // Now just a long list of grabbing values
      const oldName = toNuke.name
      const oldNSFW = toNuke.nsfw
      const oldParent = toNuke.parent
      const oldPermissions = toNuke.permissionOverwrites
      const oldPosition = toNuke.rawPosition
      const oldRatelimit = toNuke.rateLimitPerUser
      const oldTopic = toNuke.topic

      toNuke.delete({reason: `Moderator: ${message.author.tag}`})
        .catch(err => message.channel.send(`Error while deleting the channel! Please report this to the support server or fix it if you know what to do\n${err}`))
      const newChannel = await message.guild.channels.create(oldName, {
        topic: oldTopic,
        nsfw: oldNSFW,
        parent: oldParent,
        permissionOverwrites: oldPermissions,
        position: oldPosition,
        rateLimitPerUser: oldRatelimit,
        reason: `Moderator: ${message.author.tag}`
      })
        .catch(err => message.channel.send(`Error while creating the new channel! Please report this to the support server or fix it if you know what to do\n${err}`))

      newChannel.send(":boom:")
      newChannel.send("This channel got nuked! :wink:")

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}
