const { MessageEmbed } = require('discord.js');
const wait = require('util').promisify(setTimeout)
const { promptMessage, responseEmbed } = require('../../functions.js')
const auth = new Set();
const cooldown = new Set();

module.exports = {
    name: "createembed",
    aliases: ['ce','c-embed','new-embed'],
    category: "server",
    description: "Creates a MessageEmbed, you can add any of the flags listed below in the usage if you need them",
    usage: '[-field] [-image] [-thumbnail]',
    timeout: '3 seconds',
    run: async (client, message, args) => {
      if(message.deletable) {
        message.delete
      }
      if(cooldown.has(message.author.id)) {
        return message.reply('woah, that is too fast for me to keep up!')
          .then(m => m.delete({timeout: 2500}))
      } else {
        auth.add('669051415074832397')
        if(message.member.hasPermission("MANAGE_MESSAGES") && message.member.has("EMBED_LINKS")) {
          auth.add(message.author.id)
        }
        if(!auth.has(message.author.id)) return responseEmbed(3, "Unauthorized: You don't have MANAGE MESSAGES and EMBED LINKS", "CHANNEL", message, client)

        const embed = new MessageEmbed()
        const promptEmbed = new MessageEmbed()
        let _channel, failed;
        // Clear off filter
        const filter = m => m.author === message.author;

        // Title
        message.channel.startTyping();
        await wait(1000);
        await message.channel.send("What will be the title of the embed? (Under 32 characters)")
        message.channel.stopTyping(true);

        await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
          .then(collected => {
            if(!collected.first()) {
              failed = true
              return message.reply('you did not respond in time!')
            }  
            if(collected.first().content.length >= 33) {
                failed = true
                return responseEmbed(3, "Bad Usage: Title is too long", "CHANNEL", message, client)
              }
            embed
            .setTitle(collected.first().content)
          })

        if(failed === true) return;
        await wait(5000);

        // Color
        message.channel.startTyping();
        await wait(1000);
        await message.channel.send("What will be the color of the embed?")
        message.channel.stopTyping(true);

        await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
          .then(collected => {
            if(!collected.first()) {
              failed = true
              return message.reply('you did not respond in time!')
            }
            // Check the input for valid input
            var color = collected.first().content;
            var hexRegex = /^#[0-9A-F]{6}$/i
            var jsColorRegex = ["DEFAULT","WHITE","AQUA","GREEN","BLUE","YELLOW","PURPLE","LUMINOUS_VIVID_PINK","GOLD","ORANGE","RED","GREY",
            "DARKER_GREY","NAVY","DARK_AQUA","DARK_GREEN","DARK_BLUE","DARK_PURPLE","DARK_VIVID_PINK","DARK_GOLD","DARK_ORANGE","DARK_RED",
            "DARK_GREY","LIGHT_GREY","DARK_NAVY","BLURPLE","GREYPLE","DARK_BUT_NOT_BLACK","NOT_QUITE_BLACK"]
            if(!hexRegex.test(color) && jsColorRegex.indexOf(color) === -1) {
              failed = true
              return responseEmbed(3, "Bad Usage: You must supply a hex code or Discord.js color code", "CHANNEL", message, client)
            }
            embed
            .setColor(collected.first().content)
          })

        if(failed === true) return;
        await wait(5000);

        // Description
        message.channel.startTyping();
        await wait(1000);
        await message.channel.send("What is the description of the embed?")
        message.channel.stopTyping(true);

        await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
          .then(collected => {
            if(!collected.first()) {
              failed = true
              return responseEmbed(3, "Timed Out: You did not respond in time", "CHANNEL", message, client)
            }
            embed
            .setDescription(collected.first().content)
          })

        await wait(5000);

// START FLAGS
{
        if(message.content.includes("-field") === true) {
        // Field
        message.channel.startTyping();
        await wait(1000);
        await message.channel.send("What is the field of the embed? \
        \
        Format: TITLE,DESCRIPTION,INLINE(true/false)\
        Example: \`Testing,This is simply a test,true\`")
        message.channel.stopTyping(true);

        await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
          .then(collected => {
            if(!collected.first()) {
              failed = true
              return responseEmbed(3, "Timed Out: You did not respond in time", "CHANNEL", message, client)
            }
            const array = collected.first().content.split(",")
            embed
            .addField(array[0],array[1],array[2])
          })

        await wait(5000);
        }
        if(message.content.includes("-image") === true) {
        // Image
        message.channel.startTyping();
        await wait(1000);
        await message.channel.send("What is the image of the embed?")
        message.channel.stopTyping(true);

        await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
          .then(collected => {
            if(!collected.first()) {
              failed = true
              return responseEmbed(3, "Timed Out: You did not respond in time", "CHANNEL", message, client)
            }
            embed
            .setImage(collected.first().content)
          })

        await wait(5000);
        }
        // Thumbnail
        if(message.content.includes("-thumbnail") === true) {
        message.channel.startTyping();
        await wait(1000);
        await message.channel.send("What is the thumbnail URL?")
        message.channel.stopTyping(true);

        await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
          .then(collected => {
            if(!collected.first()) {
              failed = true
              return responseEmbed(3, "Timed Out: You did not respond in time", "CHANNEL", message, client)
            }
            embed.setThumbnail(collected.first().content)
          })
        await wait(5000);
        }
}
// END FLAGS

        // Channel
        message.channel.startTyping();
        await wait(1000);
        await message.channel.send("Where will the embed be posted? (You can provide a cAsE SeNSiTiVe name, ID, or mention one)")
        message.channel.stopTyping(true);

        await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
          .then(collected => {
            if(!collected.first()) {
              failed = true
              return responseEmbed(3, "Timed Out: You did not respond in time", "CHANNEL", message, client)
            }
            _channel = message.guild.channels.cache.find(c => c.name === collected.first().content)
            || message.guild.channels.cache.find(c => c.id === collected.first().content)
            || collected.first().mentions.channels.first()
            if(!_channel) {
              failed = true
              return responseEmbed(3, "Not Found: I didn't find anything for " + collected.first().content, "CHANNEL", message, client)
            }
          })

        if(failed === true) return;
        await wait(5000);

        promptEmbed
            .setColor("YELLOW")
            .setAuthor(`This expires in 30 seconds`)
            .setDescription(`Confirm you wish to send an embed to ${_channel} with the title "${embed.title}"?`)

        // Send the message
        await message.channel.send(promptEmbed).then(async msg => {
          // Await the reactions and the reaction collector
          const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

          // The verification stuffs
          if (emoji === "✅") {
            msg.delete();
            const status = await message.channel.send(`:gear: Posting the embed to ${_channel}`)

            _channel.startTyping();
            await wait(3000);
            await _channel.send(embed.setTimestamp())
            _channel.stopTyping(true);
            status.edit(`:white_check_mark: Posted to ${_channel}!\n  If you supplied an invalid value for any of the flags, those flags are disabled!`)

          } else if (emoji === "❌") {
            msg.delete();

            message.reply(`embed post cancelled`)
          }
        });

        cooldown.add(message.author.id)
        auth.delete(message.author.id)
        setTimeout(() => {
          cooldown.delete(message.author.id)
        }, 3000)
      }
    }
}