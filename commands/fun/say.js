const { MessageEmbed } = require("discord.js");
const { errorEmbed, responseEmbed } = require("../../functions.js");
const cooldown = new Set()
const auth = new Set()

module.exports = {
    name: "say",
    aliases: ["bc", "broadcast"],
    description: "Says your input via the bot. This is logged to a private console",
    category: 'fun',
    usage: "<input>",
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add("669051415074832397")

      if(message.member.hasPermission("MANAGE_MESSAGES")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) responseEmbed(3, "Unauthorized: You don't have MANAGE MESSAGES", "CHANNEL", message, client)
      if (args.length < 0) responseEmbed(3, "Bad usage: You must supply input", "CHANNEL", message, client)

      let sOwner;
      await client.users.fetch(`${message.guild.ownerID}`)
      .then(user => sOwner === user);

      message.channel.send(args.slice(0).join(" "), {disableMentions: 'everyone'})
      const iAMchannel = client.channels.cache.find(channel => channel.id === "767340595039436820")
      const embed = new MessageEmbed()
      .setTitle('Say Command')
      .setColor("RANDOM")
      .setDescription(`Content: [${args.slice(0).join(" ")}]`)
      .addFields(
        {name: `Author Mention`, value: `${message.author}`, inline: true},
        {name: `Author Tag`, value: `${message.author.tag}`, inline: true},
        {name: `Author ID`, value: `${message.author.id}`, inline: true},
        {name: `Channel Mention`, value: `${message.channel}`, inline: true},
        {name: `Channel Name`, value: `${message.channel.name}`, inline: true},
        {name: `Channel ID`, value: `${message.channel.id}`, inline: true},
        {name: `Guild Owner`, value: `${sOwner}`, inline: true},
        {name: `Guild Name`, value: `${message.guild.name}`, inline: true},
        {name: `Guild ID`, value: `${message.guild.id}`, inline: true}
      )
      .setTimestamp();

      await iAMchannel.send(embed)

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}
