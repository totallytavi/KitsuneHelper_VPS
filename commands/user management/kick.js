const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { promptMessage, errorEmbed, errorMessage } = require("../../functions.js");
let collectErr;
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
      auth.add('669051415074832397');

      if(message.member.hasPermission("KICK_MEMBERS")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) {
        return message.reply('kitsune leadership has not allowed you to do that!').then(m => m.delete({timeout: 2500}))
      }
      if(!message.guild.me.hasPermission("KICK_MEMBERS")) {
        const response = await errorEmbed("Insufficient permissions: I have not been allowed to kick members", message)
        return message.reply(response)
      }

      var target = message.mentions.members.first();
      var reason = args.slice(1).join(" ");

      if(!target) {
        await message.guild.members.fetch(`${args[0]}`)
        .then(guildMember => target = guildMember)
        .catch(e => collectErr = e)
        if(!target) {
          const response = await errorEmbed("Unknown guild member: No guild member found", message)
          return message.reply(response)
        }
      }
      if(!reason) {
        reason = "Not specified!"
      }

      if(!target.manageable) {
        const response = await errorEmbed("Insufficient permissions: I cannot manage this user", message)
        return message.reply(response)
      }

      const embed = new MessageEmbed()
        .setColor("#ff0000")
        .setAuthor(message.author.tag)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(stripIndents`**- Target:** ${target} (${target.id})
        **- Moderator:** ${message.member} (${message.member.id})
        **- Reason:** ${reason}`)
        .setTimestamp()

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

          target.kick({reason: `Moderator: ${message.author.tag}: ${reason}`})
            .catch(e => errorMessage(e, "Kick command", message, client));
          message.channel.send(embed)

        } else if (emoji === "❌") {
          msg.delete();

          message.reply(`kick cancelled, one user enjoys their stay!`)
            .then(m => m.delete(5000));
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
