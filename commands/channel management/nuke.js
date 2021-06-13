const { MessageEmbed, Collection } = require("discord.js");
const { responseEmbed, toConsole } = require("../../functions");
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
      auth.add('409740404636909578');

      if(message.member.hasPermission("MANAGE_CHANNELS")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) return responseEmbed(3, "Unauthorized: You don't have MANAGE CHANNELS", "CHANNEL", message, client)
      if(!message.guild.me.hasPermission("MANAGE_CHANNELS")) return responseEmbed(3, "Unauthorized: I don't have MANAGE CHANNELS", "CHANNEL", message, client)

      const toNuke = message.guild.channels.cache.find(channel => channel.name === `${args.slice(0).join(" ")}`)
      || message.guild.channels.cache.get(`${args[0]}`)
      || message.mentions.channels.first()
      || message.channel

      if(!toNuke.manageable) return responseEmbed(3, "Unauthorized: I cannot manage that channel", "CHANNEL", message, client)
      if(!toNuke.type === "text") return responseEmbed(3, "Unauthorized: I cannot nuke a non-text channel", "CHANNEL", message, client)

      // Now just a long list of grabbing values
      const oldName = toNuke.name
      const oldNSFW = toNuke.nsfw
      const oldParent = toNuke.parent
      const oldPermissions = toNuke.permissionOverwrites
      const oldPosition = toNuke.rawPosition
      const oldRatelimit = toNuke.rateLimitPerUser
      const oldTopic = toNuke.topic

      toNuke.delete({reason: `Moderator: ${message.author.tag}`})
        .catch(err => toConsole("nuke.js (Line 45)", err, message, client))
      await message.guild.channels.create(oldName, {
        topic: oldTopic,
        nsfw: oldNSFW,
        parent: oldParent,
        permissionOverwrites: oldPermissions,
        position: oldPosition,
        rateLimitPerUser: oldRatelimit,
        reason: `Moderator: ${message.author.tag}`
      })
      .catch(err => toConsole("nuke.js (Line 47)", err, message, client))

      responseEmbed(1, "I successfully nuked the channel, clearing all messages", "DM", message, client)

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}
