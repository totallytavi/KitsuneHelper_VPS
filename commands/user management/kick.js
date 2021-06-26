const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { promptMessage, responseEmbed, toConsole } = require("../../functions.js");
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "kick",
    category: "user management",
    description: "Kicks a user from the server",
    usage: '<user> [reason]',
    timeout: "15 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add('409740404636909578');

      if(message.member.hasPermission("KICK_MEMBERS")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) return responseEmbed(3, "Unauthorized: You don't have KICK MEMBERS", "CHANNEL", message, client)
      if(!message.guild.me.hasPermission("KICK_MEMBERS")) return responseEmbed(3, "Unauthorized: I don't have KICK MEMBERS", "CHANNEL", message, client)

      var target = message.guild.members.cache.get(`${args[0]}`)
      || message.mentions.members.first();
      var reason = args.slice(1).join(" ");

      if(!target) return responseEmbed(3, "Not Found: I couldn't find anything for " + args[0], "CHANNEL", message, client)
      if(!reason) {
        reason = "Not specified!"
      }

      if(!target.manageable) return responseEmbed(3, "Unauthorized: I cannot kick that user", "CHANNEL", message, client)

      const promptEmbed = new MessageEmbed()
        .setColor("YELLOW")
        .setAuthor(`This expires in 30 seconds`)
        .setDescription(`Confirm you wish to kick ${target}?`)

      // Send the message
      await message.channel.send(promptEmbed).then(async msg => {
        // Await the reactions and the reaction collector
        const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

        // The verification stuffs
        if (emoji === "✅") {
          msg.delete();

          target.kick({reason: `Moderator ${message.author.tag} (${message.author.id}): ${reason}`})
            .catch(e => toConsole(String(e), "kick.js (Line 53)", message, client));
          
          responseEmbed(1, `${message.author} (${message.author.id}) banned ${target} (${target.id}) for ${reason}`, "CHANNEL", message, client)

        } else if (emoji === "❌") {
          msg.delete();

          responseEmbed(1, "Kick cancelled", "CHANNEL", message, client)
          }
      });

      auth.delete(message.author.id);
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 15000);
    }
  }
}
