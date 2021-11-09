const { Message, Client, MessageEmbed, Interaction } = require(`discord.js`);
const fetch = require(`fetch`).fetchUrl;

const errors = {
  "[ERR-CLD]": "You are on cooldown!",
  "[ERR-UPRM]": "You do not have the proper permissions to execute this command",
  "[ERR-BPRM]": "I do not have the proper permissions to execute this command",
  "[ERR-ARGS]": "You have not supplied the correct parameters. Please check again",
  "[ERR-UNK]": "I can't tell why an issue spawned. Please report this to the support server! (/support)",
  "[WARN-NODM]": "Sorry, but all slash commands only work in a server, not DMs",
  "[INFO-DEV]": "This command is in development. This should not be expected to work"
}

module.exports = {
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
       * Keeping this so that I can still log stuff from the main file.
       * @param {String} reason The message to send
       * @param {String} source Where the message originated from
       * @param {null} message Message object, must be left blank
       * @param {Client} client Client object, cannot be left blank
       * @param {Boolean} ephemeral Should the result be silent, cannot be left blank
       * @returns {null}
       * @example toConsole("index.js (Line 69)", "We hit an error!", '', client)
       */
      toConsole: async function(reason, source, message, client, ephemeral) {
        if(!reason) return Promise.reject("reason is a required argument, " + source);
        if(typeof reason != 'string') return Promise.reject("reason is not a string, " + source);
        if(!source) return Promise.reject("source is a required argument, " + source);
        if(typeof source != 'string') return Promise.reject("source is not a string, " + source);
        if(!client) return Promise.reject("client is a required argument, " + source);
        if(typeof client != 'object') return Promise.reject("client is not an object, " + source);
        if(!ephemeral) return Promise.reject("ephemeral is a required argument, " + source);
        if(typeof ephemeral != 'boolean') return Promise.reject("ephemeral is not an object, " + source);

        if(typeof client.channels.cache.get('775560270700347432') != 'object') return console.log("Error channel was not found; aborting...")
        reason = errors[reason] ?? `No error code was found with ${reason}. Please forward this to the support server!`;

        if(ephemeral) interaction.ephemeral = true;
        const embed = new MessageEmbed()
        switch(typeof message.content) {
          case 'string':
            embed
            .setTitle("Message to Console")
            .setColor("RED")
            .setThumbnail(message.author.avatarURL({ dynamic: true, size: 2048 }))
            .addFields(
              { name: "Source", value: source, inline: true },
              { name: "Author", value: `Author: ${message.author} (${message.author.tag} - ${message.author.id})`, inline: true },
              { name: "Error", value: reason, inline: false }
            )
            .setFooter(`${message.guild.name} (${message.guild.id})`, message.guild.iconURL({ dynamic: true }))
            .setTimestamp();
            
            if(!reason.includes("**Command ran**")) {
            message.channel.send(`A message has been sent to the developer regarding an error. It is below if you wish to debug it\n> ${reason}`)
            }

            client.channels.cache.get('775560270700347432').send(embed)

            break;
          default:
            embed
            .setTitle("Message to Console")
            .setColor("RED")
            .addFields(
              { name: "Source", value: source, inline: true },
              { name: "Author", value: `Unknown`, inline: true },
              { name: "Error", value: reason, inline: false }
            )
            .setFooter(`Unknown`)
            .setTimestamp();

            client.channels.cache.get('775560270700347432').send(embed)

            break;
        }
      },

      /**
       * @param {String} reason The message to send
       * @param {String} source Where the message originated from
       * @param {Interaction} interaction Interaction object, can be left blank
       * @param {Client} client Client object, cannot be left blank
       * @returns {null}
       * @example interactionToConsole("say.js (Line 69)", "We hit an error!", message, client)
       */
       interactionToConsole: async function(reason, source, interaction, client) {
        if(!reason) return Promise.reject("reason is a required argument, " + source);
        if(typeof reason != 'string') return Promise.reject("reason is not a string, " + source);
        if(!source) return Promise.reject("source is a required argument, " + source);
        if(typeof source != 'string') return Promise.reject("source is not a string, " + source);
        if(!client) return Promise.reject("client is a required argument, " + source);
        if(typeof client != 'object') return Promise.reject("client is not an object, " + source);

        if(typeof client.channels.cache.get('775560270700347432') != 'object') {
          await fetch('https://discord.com/api/webhooks/856949475058253824/NY1uybEAoKOBReAlvsIU5OsYl2yHoW5Wu38O8otTfVBznMNf_lf2PSxe_9j8Iu5D6DcB?wait=true', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            payload: JSON.stringify({
              "content": "@everyone",
              "embeds": [{
                "title": "Error",
                "description": reason,
                "timestamp": new Date(),
                "footer": {
                  "text": source
                }
              }]
            })
          }, (err, meta, body) => {
            body.toString();
          });
          return false;
          // Above written all with GitHub Co-Pilot and some of my own stuff. Leaving it here in case I need to use it again.
        }

        if(interaction) {
          const embed = new MessageEmbed()
          embed
          .setTitle("Message to Console")
          .setColor("RED")
          .setThumbnail(interaction.user.avatarURL({ dynamic: true, size: 2048 }))
          .addFields(
            { name: "Source", value: source, inline: true },
            { name: "Author", value: `Author: ${interaction.user} (${interaction.user.tag} - ${interaction.user.id})`, inline: true },
            { name: "Type", value: interaction.type, inline: true },
            { name: "Error", value: reason, inline: false }
          )
          .setFooter(`${interaction.guild.name} (${interaction.guild.id})`, interaction.guild.iconURL({ dynamic: true }))
          .setTimestamp();

          if(interaction.ephemeral != true) interaction.deleteReply();
          if(source != `index.js (Line 87)`) interaction.editReply({ content: `An error occurred and has been logged in the support server. We're sorry and will work to fix this!\n\n${reason}` });

          client.channels.cache.get('775560270700347432').send({ embeds: [embed] }) 
        } else {
          const embed = new MessageEmbed()
          embed
          .setTitle("Message to Console")
          .setColor("RED")
          .addFields(
            { name: "Source", value: source, inline: true },
            { name: "Author", value: `Unknown Author`, inline: true },
            { name: "Error", value: reason, inline: false }
          )
          .setFooter(`Unknown Guild (Unknown Guild ID)`)
          .setTimestamp();

          client.channels.cache.get('775560270700347432').send({ embeds: [embed] })
        }
      },

      /**
       * Replies with an embed to the interaction. Alternative for responseEmbed()
       * @param {Number} type 1- Sucessful, 2- Warning, 3- Error, 4- Information
       * @param {String} content The information to state
       * @param {Interaction} interaction The Interaction object for responding
       * @param {Client} client Client object for logging
       * @param {Boolean} ephemeral Whether or not to ephemeral the message
       * @returns {null}
       */
      interactionEmbed: async function(type, content, interaction, client, ephemeral) {
        if(typeof type != 'number') return Promise.reject("type is not a number, " + source);
        if(type < 1 || type > 4) return Promise.reject("type is not a valid integer, " + source);
        if(typeof content != 'string') return Promise.reject("content is not a string, " + source);
        if(!interaction) return Promise.reject("interaction is a required argument, " + source);
        if(typeof interaction != 'object') return Promise.reject("interaction is not an object, " + source);
        if(!client) return Promise.reject("client is a required argument, " + source);
        if(typeof client != 'object') return Promise.reject("client is not an object, " + source);
        if(!ephemeral) return Promise.reject("ephemeral is a required argument, " + source);
        if(typeof ephemeral != 'boolean') return Promise.reject("ephemeral is not an object, " + source);

        const embed = new MessageEmbed();

        switch(type) {
          case 1:
            embed
            .setTitle("Success")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true, size: 4096 }))
            .setColor("BLURPLE")
            .setDescription(errors[content] ?? content)
            .setFooter("The operation was completed successfully with no errors")
            .setTimestamp();

            if(interaction.ephemeral != true) interaction.deleteReply();
            await interaction.followUp({ embeds: [embed], ephemeral: ephemeral })

            break;
          case 2:
            embed
            .setTitle("Warning")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true, size: 4096 }))
            .setColor("ORANGE")
            .setDescription(errors[content] ?? content)
            .setFooter("The operation was completed successfully with a minor error")
            .setTimestamp();

            if(interaction.ephemeral != true) interaction.deleteReply();
            await interaction.followUp({ embeds: [embed], ephemeral: ephemeral })

            break;
          case 3:
            embed
            .setTitle("Error")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true, size: 4096 }))
            .setColor("RED")
            .setDescription(errors[content] ?? `I don't understand the error "${content}". Please report this to the support server!`)
            .setFooter("The operation failed to complete due to an error")
            .setTimestamp();

            if(interaction.ephemeral != true) interaction.deleteReply();
            await interaction.followUp({ embeds: [embed], ephemeral: ephemeral })

            break;
          case 4:
            embed
            .setTitle("Information")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true, size: 4096 }))
            .setColor("BLURPLE")
            .setDescription(errors[content] ?? content)
            .setFooter("The operation is pending completion")
            .setTimestamp();

            if(interaction.ephemeral != true) interaction.deleteReply();
            await interaction.followUp({ embeds: [embed], ephemeral: ephemeral })

            break;
        }
      }
};