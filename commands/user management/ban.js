const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { promptMessage, toConsole, responseEmbed } = require("../../functions.js");
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "ban",
    category: "user management",
    description: "Bans a member from your server",
    usage: '<target> [reason]',
    timeout: "15 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add("669051415074832397")

      if(message.member.hasPermission("BAN_MEMBERS")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) responseEmbed(3, "Unauthorized: You don't have BAN MEMBERS", "CHANNEL", message, client)
      if(!message.guild.me.hasPermission("BAN_MEMBERS")) responseEmbed(3, "Unauthorized: I don't have BAN MEMBERS", "CHANNEL", message, client)

      var target = message.guild.members.cache.get(`${args[0]}`)
      || message.mentions.members.first();
      var reason = args.slice(1).join(" ");

      if(!target) responseEmbed(3, "Not Found: I couldn't find anything for " + args[0], "CHANNEL", message, client)
      if(!reason) {
        reason = "Not specified!"
      }

      // Can't ban urself
      if (target.id === message.author.id) responseEmbed(3, "Bad Usage: You cannot ban yourself", "CHANNEL", message, client)

      // Check if the user's banable
      if (!target.bannable) responseEmbed(3, "Unauthorized: I cannot ban that user", "CHANNEL", message, client)

      const promptEmbed = new MessageEmbed()
        .setColor("GREEN")
        .setAuthor(`Ban Confirmation`)
        .setDescription(`Are you sure you want to ban ${target}?`)

      // Send the message
      await message.channel.send(promptEmbed).then(async msg => {
        // Await the reactions and the reactioncollector
        const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

          // Verification stuffs
          if (emoji === "✅") {
            msg.delete();

            target.ban({reason: `Moderator ${message.author.tag} (${message.author.id}): ${reason}`})
            .catch(err => toConsole(err, "ban.js (Line 66)", message, client))

            responseEmbed(1, `${message.author} (${message.author.id}) banned ${target} (${target.user.id}) for ${reason}`, "CHANNEL", message, client)

            message.channel.send(embed);
          } else if (emoji === "❌") {
            msg.delete();

            responseEmbed(1, "Ban cancelled", "CHANNEL", message, client)
          }
      });

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 15000);
    }
  }
}

// JS
