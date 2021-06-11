const { Message, Client, MessageEmbed, User, GuildChannel } = require('discord.js');

module.exports = {

    getMember: async function(message, toFind = '') {
        toFind = toFind.toLowerCase();
        await message.guild.members.fetch();

        let target = message.guild.members.cache.get(toFind);
        
        if (!target && message.mentions.members)
            target = message.mentions.members.first();

        if (!target) {
            target = "Unknown"
        }

        if (!target && toFind) {
            target = message.guild.members.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                member.user.tag.toLowerCase().includes(toFind)
            });
        }
            
        if (!target) 
            target = message.member;
            
        return target;
    },

    formatDate: async function(date) {
        return new Intl.DateTimeFormat('en-US').format(date)
    },

    promptMessage: async function (message, author, time, validReactions) {
        // We put in the time as seconds, with this it's being transfered to MS
        time *= 1000;

        // For every emoji in the function parameters, react in the good order.
        for (const reaction of validReactions) await message.react(reaction);

        // Only allow reactions from the author, 
        // and the emoji must be in the array we provided.
        const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id;

        // And ofcourse, await the reactions
        return message
            .awaitReactions(filter, { max: 1, time: time})
            .then(collected => collected.first() && collected.first().emoji.name);
    },

    /**
     * @param {String} type 1- Sucessful, 2- Warning, 3- Error, 4- Information
     * @param {String} content The information to state
     * @param {String} recipient DM- requires a User object, CHANNEL- requires GuildChannel object
     * @param {Message} message Message object for authoring
     * @param {Client} client Client object for logging
     * @example responseEmbed(1, "Successful: The channel's permissions were synced with the category", message, client)
     * @returns {null}
     */
    responseEmbed: async function(type, content, recipient, message, client) {
        // First run checks to make sure the variables are valid for use
        if(typeof type != 'number') return new SyntaxError("type is not a number");
        if(type < 1 || type > 4) return new SyntaxError("type is not a valid integer");
        if(typeof content != 'string') return new SyntaxError("content is not a string");
        if(typeof recipient != 'string') return new SyntaxError("recipient is a required argument")
        if(recipient != "CHANNEL" && recipient != "DM") return new SyntaxError("recipient is not a valid string")
        if(!message) return new SyntaxError("message is a required argument");
        if(typeof message != 'object') return new SyntaxError("message is not an object");
        if(!client) return new SyntaxError("client is a required argument");
        if(typeof client != 'object') return new SyntaxError("client is not an object");

        const embed = new MessageEmbed()
  
        // Next, check where it's supposed to be sent to
        switch(recipient) {
          // If it's for a channel...
          case "CHANNEL":
            // Check what kind of message it is
            switch(type) {
              // Success
              case 1: 
                embed
                .setTitle("Success")
                .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true, size: 4096 }))
                .setColor("GREEN")
                .setDescription(content)
                .setFooter("The operation was completed successfully with no errors")
                .setTimestamp();
  
                message.channel.send(embed)
          
                break;
              // Warning
              case 2:
                embed
                .setTitle("Warning")
                .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true, size: 4096 }))
                .setColor("ORANGE")
                .setDescription(content)
                .setFooter("The operation was completed successfully with a minor error")
                .setTimestamp();
  
                message.channel.send(embed)
  
                break;
              // Failure
              case 3:
                embed
                .setTitle("Error")
                .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true, size: 4096 }))
                .setColor("RED")
                .setDescription(content)
                .setFooter("The operation failed to complete due to an error")
                .setTimestamp();
  
                message.channel.send(embed)
  
                break;
              // Information
              case 4:
                embed
                .setTitle("Information")
                .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true, size: 4096 }))
                .setColor("BLURPLE")
                .setDescription(content)
                .setFooter("The operation is pending completion")
                .setTimestamp();
  
                message.channel.send(embed)
  
                break;
              // None of the above
              default:
                Promise.reject("type was not a valid integer and passed checks")
                break;
            }
            break;
          // If it's for a DM...
          case "DM":
            // Check what kind of message it is
            switch(type) {
              // Success
              case 1: 
                embed
                .setTitle("Success")
                .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true, size: 4096 }))
                .setColor("GREEN")
                .setDescription(content)
                .setFooter("The operation was completed successfully with no errors")
                .setTimestamp();
  
                try {
                  message.author.send(embed)
                } catch(e) {
                  message.reply(`this was posted here as I could not DM you`, embed)
                }
          
                break;
              // Warning
              case 2:
                embed
                .setTitle("Warning")
                .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true, size: 4096 }))
                .setColor("ORANGE")
                .setDescription(content)
                .setFooter("The operation was completed successfully with a minor error")
                .setTimestamp();
  
                try {
                  message.author.send(embed)
                } catch(e) {
                  message.reply(`this was posted here as I could not DM you`, embed)
                }
  
                break;
              // Failure
              case 3:
                embed
                .setTitle("Error")
                .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true, size: 4096 }))
                .setColor("RED")
                .setDescription(content)
                .setFooter("The operation failed to complete due to an error")
                .setTimestamp();
  
                try {
                  message.author.send(embed)
                } catch(e) {
                  message.reply(`this was posted here as I could not DM you`, embed)
                }
  
                break;
              // Information
              case 4:
                embed
                .setTitle("Information")
                .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true, size: 4096 }))
                .setColor("BLURPLE")
                .setDescription(content)
                .setFooter("The operation is pending completion")
                .setTimestamp();
  
                try {
                  message.author.send(embed)
                } catch(e) {
                  message.reply(`this was posted here as I could not DM you`, embed)
                }
  
                break;
              // None of the above
              default:
                Promise.reject("type was not a valid integer and passed checks")
                break;
            }
        }
      },
      
      /**
       * @param {String} reason The message to send
       * @param {String} source Where the message originated from
       * @param {Message} message Message object, can be left blank
       * @param {Client} client Client object, cannot be left blank
       * @returns {null}
       * @example toConsole("say.js (Line 69)", "We hit an error!", message, client)
       * @example toConsole("index.js (Line 69)", "We hit an error!", '', client)
       */
      toConsole: async function(reason, source, message, client) {
        if(!source) return new SyntaxError("source is a required argument");
        if(typeof source != 'string') return new SyntaxError("source is not a string");
        if(!reason) return new SyntaxError("reason is a required argument");
        if(typeof reason != 'string') return new SyntaxError("reason is not a string");
        if(typeof message != 'object') return new SyntaxError("message is not an object");
        if(!client) return new SyntaxError("client is a required argument")
        if(typeof client != 'object') return new SyntaxError("client is not an object");

        if(typeof client.channels.cache.get('775560270700347432') != 'object') return console.log("Error channel was not found; aborting...")

        const  embed = new MessageEmbed()
        switch(typeof message) {
          case 'object':
            embed
            .setTitle("Message to Console")
            .setColor("RED")
            .setThumbnail(message.author.avatarURL({ dynamic: true, size: 2048 }))
            .addFields(
              { name: "Source", value: source, inline: true },
              { name: "Author", value: `Author: ${message.author} (${message.author.tag} - ${message.author.id})`, inline: true },
              { name: "Error", value: reason, inline: true }
            )
            .setFooter(`${message.guild.name} (${message.guild.id})`, message.guild.iconURL({ dynamic: true }))
            .setTimestamp();
            
            if(!reason.includes("**Command ran**")) {
            message.channel.send(`A message has been sent to the developer regarding an error. It is below if you wish to debug it\n> ${reason}`)
            }

            client.channels.cache.get('775560270700347432').send(embed)

            break;
          case 'undefined':
            embed
            .setTitle("Message to Console")
            .setColor("RED")
            .addFields(
              { name: "Source", value: source, inline: true },
              { name: "Author", value: `Unknown`, inline: true },
              { name: "Error", value: reason, inline: true }
            )
            .setFooter(`Unknown`)
            .setTimestamp();

            client.channels.cache.get('775560270700347432').send(embed)

            break;
        }
      }
};