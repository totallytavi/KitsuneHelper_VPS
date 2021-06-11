const { MessageEmbed } = require("discord.js");
const { responseEmbed } = require("../../functions");
const cooldown = new Set();

module.exports = {
    name: "roleperm",
    aliases: ['ri','roleinfo'],
    category: "information",
    description: "Fetchs the information for a role, useful for role permission debugging",
    usage: '<role>',
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {

      if(!args[0]) responseEmbed(3, "Bad Usage: You must supply a role", "CHANNEL", message, client)

      const roleInfo = message.guild.roles.cache.find(r => r.name === `${args.slice(0).join(" ")}`) 
      || message.guild.roles.cache.find(r => r.id === `${args[0]}`)
      || message.mentions.roles.first()
      || message.guild.roles.cache.find(r => r.name.includes(args.slice(0).join(" ")))

      if(!roleInfo) responseEmbed(3, "Not Found: I couldn't find anything for " + args.slice(0).join(" "), "CHANNEL", message, client)

      var rolePerms = [];

      // Quite literally a long string of me just checking for perms
    {
      //Server
      if(roleInfo.permissions.has("ADMINISTRATOR")) {
        rolePerms.push('**Administrator**')
      }
      if(roleInfo.permissions.has("VIEW_GUILD_INSIGHTS")) {
        rolePerms.push('\`View Server Insights\`')
      }
      if(roleInfo.permissions.has("VIEW_AUDIT_LOG")) {
        rolePerms.push('\`View the Audit Log\`')
      }
      if(roleInfo.permissions.has("MANAGE_GUILD")) {
        rolePerms.push('\`Manage Server\`')
      }
      if(roleInfo.permissions.has("MANAGE_ROLES")) {
        rolePerms.push('\`Manage and Assign Roles\`')
      }
      if(roleInfo.permissions.has("MANAGE_CHANNELS")) {
        rolePerms.push('\`Manage Channels\`')
      }
      if(roleInfo.permissions.has("KICK_MEMBERS")) {
        rolePerms.push('\`Kick Members\`')
      }
      if(roleInfo.permissions.has("BAN_MEMBERS")) {
        rolePerms.push('\`Ban Members\`')
      }
      if(roleInfo.permissions.has("CREATE_INSTANT_INVITE")) {
        rolePerms.push('\`Create Invites\`')
      }
      if(roleInfo.permissions.has("CHANGE_NICKNAME")) {
        rolePerms.push('\`Change Own Nickname\`')
      }
      if(roleInfo.permissions.has("MANAGE_NICKNAMES")) {
        rolePerms.push("\`Manage Nicknames\`")
      }
      if(roleInfo.permissions.has("MANAGE_EMOJIS")) {
        rolePerms.push('\`Manage Emojis\`')
      }
      if(roleInfo.permissions.has("MANAGE_WEBHOOKS")) {
        rolePerms.push('\`Manage Webhooks\`')
      }
      if(roleInfo.permissions.has("VIEW_CHANNEL")) {
        rolePerms.push('\`View Text Channels and Voice Channels\`')
      }
      // Message
      if(roleInfo.permissions.has("SEND_MESSAGES")) {
        rolePerms.push('\`Send Messages\`')
      }
      if(roleInfo.permissions.has("SEND_TTS_MESSAGES")) {
        rolePerms.push('\`Send Text to Speech Messages\`')
      }
      if(roleInfo.permissions.has("MANAGE_MESSAGES")) {
        rolePerms.push('\`Manage Messages\`')
      }
      if(roleInfo.permissions.has("EMBED_LINKS")) {
        rolePerms.push('\`Embed Links\`')
      }
      if(roleInfo.permissions.has("ATTACH_FILES")) {
        rolePerms.push('\`Attach Files\`')
      }
      if(roleInfo.permissions.has("READ_MESSAGE_HISTORY")) {
        rolePerms.push('\`Read Message History\`')
      }
      if(roleInfo.permissions.has("MENTION_EVERYONE")) {
        rolePerms.push('\`Mention everyone, here, and all roles\`')
      }
      if(roleInfo.permissions.has("USE_EXTERNAL_EMOJIS")) {
        rolePerms.push('\`Use Emojis From Other Servers\`')
      }
      if(roleInfo.permissions.has("ADD_REACTIONS")) {
        rolePerms.push('\`Add Reactions to Any Message\`')
      }
      // Voice
      if(roleInfo.permissions.has("CONNECT")) {
        rolePerms.push('\`Connect to Voice Channels\`')
      }
      if(roleInfo.permissions.has("SPEAK")) {
        rolePerms.push('\`Speak in Voice Channels\`')
      }
      if(roleInfo.permissions.has("STREAM")) {
        rolePerms.push('\`Use Video and Go Live\`')
      }
      if(roleInfo.permissions.has("MUTE_MEMBERS")) {
        rolePerms.push('\`Server Mute Members\`')
      }
      if(roleInfo.permissions.has("DEAFEN_MEMBERS")) {
        rolePerms.push('\`Server Deafen Members\`')
      }
      if(roleInfo.permissions.has("USE_VAD")) {
        rolePerms.push('\`Use Voice Activity\`')
      }
      if(roleInfo.permissions.has("PRIORITY_SPEAKER")) {
        rolePerms.push('\`Priority Speaker\`')
      }
    }

      let embed = new MessageEmbed()
      .setTitle("Role Information")
      .setColor("RANDOM")
      .setDescription(`Information on ${roleInfo.name}`)
      .addFields(
        { name: "Name", value: `${roleInfo.name}`, inline: true },
        { name: "ID", value: `${roleInfo.id}`, inline: true },
        { name: "Hex code", value: `${roleInfo.hexColor}`, inline: true },
        { name: "Mentionable?", value: `${roleInfo.mentionable}`, inline: true },
        { name: "Hoisted?", value: `${roleInfo.hoist}`, inline: true },
        { name: '\u200B', value: '\u200B' },
        { name: "Permissions", value: `${rolePerms.join(", ") || 'No permissions'}`, inline: false }
      )
      .setTimestamp();

      message.channel.send(embed);

      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}
