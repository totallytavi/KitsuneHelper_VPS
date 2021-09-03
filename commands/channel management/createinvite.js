const { responseEmbed, toConsole, interactionEmbed } = require("../../functions");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { Interaction } = require("discord.js");
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "createinvite",
    aliases: ['ci','createinv'],
    category: "channel management",
    description: "Creates an invite for the given channel",
    usage: '[channel] [true|false] [time in hours for the invite to last] [max uses]',
    timeout: "5 seconds",
    data: new SlashCommandBuilder()
		  .setName('createinvite')
		  .setDescription('Creates an invite in your server')
      .addChannelOption({ name: "channel", description: "The channel to create the invite for", required: false })
      .addBooleanOption({ name: "temporary", description: "Should the user be kicked when they go offline", required: false })
      .addNumberOption({ name: "age", description: "How long should the invite last for?", required: false })
      .addNumberOption({ name: "uses", description: "How many people should be able to use this?", required: false }),
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add("409740404636909578")

      if(message.member.hasPermission("CREATE_INSTANT_INVITE")) {
        auth.add(message.author.id)
      }
      if(!auth.has(message.author.id)) return responseEmbed(3, "Unauthorized: You don't have CREATE INVITES", "CHANNEL", message, client)
      if(!message.guild.me.hasPermission("CREATE_INSTANT_INVITE")) return responseEmbed(3, "Unauthorized: I don't have CREATE INVITES", "CHANNEL", message, client)

      let _channel = message.guild.channels.cache.find(channel => channel.name === `${args[0]}`)
      || message.guild.channels.cache.find(channel => channel.name === `${args[0]}`)
      || message.mentions.channels.first()
      || message.channel;

      _channel.createInvite({
        temporary: args[1],
        maxAge: args[2] * 3600,
        maxUses: args[3]
      })
      .then(invite => responseEmbed(1, "I created an invite! The URL is:\n> " + invite.url, "CHANNEL", message, client))
      .catch(err => toConsole(String(err), 'createinvite.js (Line 32)', message, client));

      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
      }
    },
    execute: async (client, interaction) => {
      auth.add("409740404636909578")

      if(interaction.member.hasPermission("CREATE_INSTANT_INVITE")) {
        auth.add(interaction.user.id)
      }
      if(!auth.has(interaction.user.id)) return interactionEmbed(3, "Unauthorized: You don't have CREATE INVITES", interaction, client)
      if(!message.guild.me.hasPermission("CREATE_INSTANT_INVITE")) return interactionEmbed(3, "Unauthorized: I don't have CREATE INVITES", interaction, client)

      let _channel = interaction.options.getChannel("channel")
      || message.channel;

      _channel.createInvite({
        temporary: args[1],
        maxAge: args[2] * 3600,
        maxUses: args[3]
      })
      .then(invite => responseEmbed(1, "I created an invite! The URL is:\n> " + invite.url, "CHANNEL", message, client))
      .catch(err => toConsole(String(err), 'createinvite.js (Line 32)', message, client));
    }
}