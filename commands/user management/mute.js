const { MessageEmbed } = require("discord.js");
const { errorMessage, promptMessage, errorEmbed } = require("../../functions");
const ms = require('ms');
const cooldown = new Set();
const auth = new Set(); 

module.exports = {
    name: "mute",
    aliases: ['silence','shutup'],
    category: "user management",
    description: "Mutes a user for a given time",
    usage: '<user> <time> [reason]',
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add('669051415074832397');

      if(message.member.hasPermission("MANAGE_MESSAGES")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) {
        return message.reply('kitsune leadership has not authorized you to do that!').then(m => m.delete({timeout: 5000}))
      }
      if(!message.guild.me.hasPermission("MANAGE_CHANNELS") && !message.channel.permissions.has("MANAGE_CHANNELS") || !message.guild.me.hasPermission("MANAGE_ROLES")) {
        const response = await errorEmbed("Insufficient permissions: I have not been allowed to manage channels or manage roles", message)
        return message.reply(response)
      }

      // return message.reply('The MUTE command is currently undergoing maintenance to move to a SQLite3 database');

      const target = message.mentions.members.first() || message.guild.members.cache.get(`${args[0]}`) || message.guild.members.cache.fetch({ query: `${args[0]}` });

      if (!target) {
        const response = await errorEmbed("Unknown guild member: No guild member found", message)
        return message.reply(response)
      }
      if(!target.manageable) {
        const response = await errorEmbed("Insufficient permissions: I cannot manage this user", message)
        return message.reply(response)
      }
   
      if(target.id === message.author.id) {
        return message.reply("I am not quite sure that muting you would do anything").then(m => m.delete({timeout: 5000}))
      }

      const time = args[1]
      var reason = args.slice(2).join(" ")
      if(!reason) {
        reason = "Not specified"
      }

      const muteRole = message.guild.roles.cache.find(r => r.name === "Muted") || message.guild.roles.cache.find(r => r.name === "muted");
      if(!muteRole) {
        const response = await errorEmbed("Unknown role: I did not find a role named \`Muted\`", message)
        return message.reply(response)
      }

      if(target.roles.cache.has(muteRole)) {
        const response = await errorEmbed("Bad usage: This user is already muted", message)
        return message.reply(response)
      }

      const embed = new MessageEmbed()
      .setTitle("Mute")
      .setColor("YELLOW")
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 2048 }))
      .setAuthor(message.author.tag)
      .addFields(
        { name: "Moderator", value: message.author, inline: true },
        { name: "Target", value: target, inline: true },
        { name: "Time", value: time, inline: true },
        { name: "Reason", value: reason, inline: false }
      )
      .setTimestamp();

      const promptEmbed = new MessageEmbed()
        .setColor("YELLOW")
        .setAuthor(`This expires in 30 seconds`)
        .setDescription(`Confirm you wish to mute ${target}?`)
      
      await message.guild.channels.cache.each(channel => {
        if(!channel.manageable) return;
        channel.updateOverwrite(muteRole, {
          SEND_MESSAGES: false,
          ADD_REACTIONS: false,
          SPEAK: false
        })
        .catch(e => errorMessage(e, "Mute command", message, client));
      }, "Mute role permissions");

      // Send the message
      await message.channel.send(promptEmbed).then(async msg => {
        // Await the reactions and the reaction collector
        const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);
        
        // The verification stuffs
        if (emoji === "✅") {
          msg.delete();

          client.db.run("INSERT INTO mutes \
          VALUES ($guild, $target, $moderator, $unmute_date, $reason);", {
            $guild: message.guild.id,
            $target: target.user.id,
            $moderator: message.author.id,
            $unmute_date: Date.now() + ms(time),
            $reason: reason
          }, result => console.log("Mute SQLite add result: " + result))
          target.roles.add(muteRole, `Moderator ${message.author.tag}: ${reason}`)
            .catch(e => errorMessage(e, "mute command", message, client))
          msg.channel.send(embed)
        } else if (emoji === "❌") {
          msg.delete();

          message.reply(`mute cancelled, one user is safe from silence!`)
            .then(m => m.delete(2500));
        }
      });

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
      cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}