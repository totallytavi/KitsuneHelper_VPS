const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { promptMessage, errorEmbed } = require("../../functions.js");
let collectErr;
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
      if(!auth.has(message.author.id)) {
        return message.reply('kitsune leadership has not allowed you to do that!').then(m => m.delete({timeout: 2500}))
      }
      if(!message.guild.me.hasPermission("BAN_MEMBERS")) {
        const response = await errorEmbed("Insufficient permissions: I have not been allowed to ban members")
        message.reply(response)
      }

      var target = message.mentions.members.first();
      var reason = args.slice(1).join(" ");

      if(!target) {
        await message.guild.members.fetch(`${args[0]}`)
        .then(guildMember => target = guildMember)
        .catch(e => collectErr = e)
        if(!target) {
          const response = await errorEmbed("Unknown guild member: No guild member found")
          return message.reply(response)
        }
      }
      if(!reason) {
        reason = "Not specified!"
      }

      // Can't ban urself
      if (target.id === message.author.id) {
        const response = await errorEmbed("Bad usage: You cannot kick yourself")
        message.reply(response)
      }

      // Check if the user's banable
      if (!target.bannable) {
        return message.reply("due to Discord hierarchy, I can't ban them. Check my highest role position").then(m => m.delete({timeout: 2500}));
      }

      const embed = new MessageEmbed()
        .setColor("#ff0000")
        .setThumbnail(target.user.displayAvatarURL)
        .setFooter(message.member.displayName, message.author.displayAvatarURL)
        .setTimestamp()
        .setDescription(stripIndents`**- Target:** ${target} (${target.id})
        **- Moderator:** ${message.member} (${message.member.id})
        **- Reason:** ${reason}`);

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

            target.ban({reason: `Moderator: ${message.author.tag}: ${reason}`, days: 7})
            .catch(err => message.reply(`Error! Please report this to the support server or fix it if you know what to do\n${err}`))

            message.channel.send(embed);
          } else if (emoji === "❌") {
            msg.delete();

            message.reply(`ban cancelled, one user doesn't get banned today!`).then(m => m.delete({timeout: 7500}));
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
