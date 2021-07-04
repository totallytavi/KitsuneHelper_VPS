const { toConsole, responseEmbed, promptMessage } = require("../../functions");
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "deletechannel",
    aliases: ["delchannel"],
    category: "channel management",
    description: "Deletes a given channel",
    usage: "<channel>",
    cooldown: "5 seconds",
    run: async (client, message, args) => {
      if(message.deletable) {
        message.delete()
      }
      if(cooldown.has(message.author.id)) {
        return message.reply("that's a little too quick!").then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add("409740404636909578")

      if(message.member.hasPermission("MANAGE_CHANNELS")) {
        auth.add(message.author.id);
      }
      if(!auth.has(message.author.id)) return responseEmbed(3, "Unauthorized: You don't have MANAGE CHANNELS", "CHANNEL", message, client)
      if(!message.guild.me.hasPermission("MANAGE_CHANNELS")) return responseEmbed(3, "Unauthorized: I don't have MANAGE CHANNELS", "CHANNEL", message, client)

      if(!args[0]) return responseEmbed(3, "Bad Usage: You must supply a channel", "CHANNEL", message, client)

      const toDelete = message.guild.channels.cache.get(`${args[0]}`)
      || message.guild.channels.cache.find(c => c.name === `${args.slice(0).join(" ")}`)
      || message.mentions.channels.first();

      if(!toDelete) return responseEmbed(3, "Not Found: No channel found for " + toDelete)

      toDelete.delete({ reason: `Moderator: ${message.author.tag} (Moderator: ${message.author.id})` })
        .then(responseEmbed(1, "The channel was deleted", "CHANNEL", message, client))
        .catch(e => toConsole(String(e), "deletechannel.js (Line 35)", message, client))

      // Make the filter, this is needed later
      const filter = m => m.author === message.author;

      if(toDelete.type === 'category') {
      message.channel.send("I detected the channel as a category, should I delete the category's channels?\n\n> *This will expire in 30 seconds*")
      .then(m => {
        const emoji = await promptMessage(m, message.author, 30, ["✅", "❌"])

        if(emoji === "✅") {
          message.guild.channels.cache.each(channel => {
            if(channel.parent != toDelete) return;
            if(!channel.manageable) return responseEmbed(1, "Unauthorized: I am not authorized to delete " + channel)

            channel.delete({ reason: `Moderator ${message.author.tag} (${message.author.id})`})
          })
        }
      })
      }

      auth.delete(message.author.id);
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000)
    }
  }
}
