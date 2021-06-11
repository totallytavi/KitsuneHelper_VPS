const { MessageEmbed } = require("discord.js");
const { responseEmbed } = require("../../functions");
const cooldown = new Set();

module.exports = {
    name: "serverinfo",
    aliases: ['si','guildinfo','gi'],
    category: "information",
    description: "Provides an embed filled with information about your server (Note: This is a big embed!)",
    usage: '[advanced? (yes)]',
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {

      var sIcon = message.guild.iconURL({dynamic: true, size: 2048})
      var sName = message.guild.name
      var sID = message.guild.id
      let sAfk, sInvites, sBans, sOwner;
      var sCreationDate = message.guild.createdAt

      // Fields
      await message.guild.fetchInvites()
      .then(invites => sInvites = `${invites.size}`)
      var sSize = message.guild.members.cache.size
      var sHumans = message.guild.members.cache.filter(m => m.user.bot != true).size;
      var sBots = sSize - sHumans
      var sTotalChannelCount = message.guild.channels.cache.size
      var text = message.guild.channels.cache.filter(c => c.type === "text").size;
      var voice = message.guild.channels.cache.filter(c => c.type === "voice").size;
      var sEmojis = message.guild.emojis.cache.size
      var sBoosts = message.guild.premiumSubscriptionCount
      await message.guild.members.fetch(message.guild.ownerID)
      .then(guildMember => sOwner = guildMember.user)

      // Advanced fields
      var sContentLevel = message.guild.explicitContentFilter    
      var sOldAfk = message.guild.afkChannel
      if(!sOldAfk) {
        sAfk = 'None'
      } else {
        sAfk = sOldAfk.name
      }
      var sFeatures = message.guild.features
      .join(' ') || "No features"
      await message.guild.fetchBans()
      .then(bans => sBans = bans.size)
      var oldMFA = message.guild.mfaLevel
      if(oldMFA = 1) {
        sMFA = "Enabled"
      } else {
        sMFA = "Disabled"
      }
      var sVerLevel = message.guild.verificationLevel

      var embed = new MessageEmbed()
      var _content = args[0]
      if(!_content) {
        _content = "no"
      }

      switch (_content.toLowerCase()) {
        case "yes":
          embed
          .setTitle(`${sName}`)
          .setAuthor(`${sOwner.username}#${sOwner.discriminator} is the server owner`, `${sOwner.avatarURL({dynamic: true, size: 2048})}`)
          .setThumbnail(`${sIcon}`)
          .setDescription(`Creation: ${sCreationDate}`)
          .addFields(
            { name: 'Basic Info', value: `This is general info for just regular members or those peeking around`, inline: false },
            { name: 'Invites', value: `${sInvites}`, inline: true },
            { name: 'Member Count', value: `${sSize} (${sHumans} humans, ${sBots} bots)`, inline: true },
            { name: 'Total Channel Count', value: `${sTotalChannelCount} (${text} text, ${voice} voice)`, inline: true },
            { name: 'Emojis', value: `${sEmojis}`, inline: true },
            { name: 'Boosts', value: `${sBoosts}`, inline: true },
            { name: 'Bans', value: `${sBans}`, inline: true },
            { name: 'Advanced Info', value: 'Diving deep into the depths of tail\'s knowledge!', inline: false },
            { name: 'Explicit Content Filter', value: `${sContentLevel}`, inline: true },
            { name: 'AFK Channel', value: `${sAfk}`, inline: true },
            { name: 'Features', value: `${sFeatures}`, inline: true },
          //  { name: 'Features', value: `Deprecated currently`, inline: true },
            { name: 'Multi-factor Verification', value: `${sMFA}`, inline: true },
            { name: 'Verification Level', value: `${sVerLevel}`, inline: true }
          )
          .setFooter(`Guild ID: ${sID} | Requested by ${message.author.tag}`, message.author.avatarURL({dynamic: true, size: 2048}))
          .setTimestamp();

          message.channel.send(embed)
          
          break;
        default: 
         embed
          .setTitle(`${sName}`)
          .setAuthor(`${sOwner.username}#${sOwner.discriminator} is the server owner`, `${sOwner.avatarURL({dynamic: true, size: 2048})}`)
          .setThumbnail(`${sIcon}`)
          .setDescription(`Creation: ${sCreationDate}`)
          .addFields(
            { name: 'Basic Info', value: `This is general info for just regular members or those peeking around`, inline: false },
            { name: 'Invites', value: `${sInvites}`, inline: true },
            { name: 'Member Count', value: `${sSize} (${sHumans} humans, ${sBots} bots)`, inline: true },
            { name: 'Total Channel Count', value: `${sTotalChannelCount} (${text} text, ${voice} voice)`, inline: true },
            { name: 'Emojis', value: `${sEmojis}`, inline: true },
            { name: 'Boosts', value: `${sBoosts}`, inline: true },
            { name: 'Bans', value: `${sBans}`, inline: true }
          )
          .setFooter(`Guild ID: ${sID} | Requested by ${message.author.tag}`, message.author.avatarURL({dynamic: true, size: 2048}))
          .setTimestamp();

          message.channel.send(embed)

          break;
      }
      

      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}