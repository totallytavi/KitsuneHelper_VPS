const { Client, MessageEmbed, Interaction, GuildMember, MessageButton, MessageActionRow } = require(`discord.js`);
const fetch = require(`fetch`).fetchUrl;
const wait = require(`util`).promisify(setTimeout);

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
    /**
     * Simple function to create a prompt message
     * @param {Interaction} interaction Interaction object
     * @param {Number} time Seconds for which the reaction is valid
     * @param {Array<MessageButton>} validButtons The buttons to place on the message
     * @param {String} content The content to display, can be blank
     * @example promptMessage(interaction, 15, [button1, button2], `This is a prompt message`, true)
     * @returns {MessageButton} The button the user clicked
     */
    promptMessage: async function (interaction, time, validButtons, content) {
      if(!interaction) return Promise.reject(`interaction is a required argument, ${time} ${content} ${ephemeral}`);
      if(typeof interaction != `object`) return Promise.reject(`interaction is not an object, ${time} ${content} ${ephemeral}`);
      if(!time) return Promise.reject(`time is a required argument, ${content} ${ephemeral}`);
      if(typeof time != `number`) return Promise.reject(`time is not a number, ${time} ${content} ${ephemeral}`);
      if(!validButtons) return Promise.reject(`validButtons is a required argument, ${time} ${content} ${ephemeral}`);
      if(typeof validButtons != `object`) return Promise.reject(`validButtons is not an object, ${time} ${content} ${ephemeral}`);
      content = content ?? `Please select an option`;
      
      // Create a filter
      const filter = i => {
        i.deferUpdate();
        return i.user.id === interaction.user.id;
      };
      // We put in the time as seconds, with this it's being transfered to MS
      time *= 1000;
      // Add a message action row to the message
      const row = new MessageActionRow();
      // Add the button to the reaction
      row.addComponents(validButtons);
      // And of course, follow up and await the buttonx
      const message = await interaction.followUp({ content: content, components: [row] })
      const res = await message
      .awaitMessageComponent({ filter, componentType: `BUTTON`, time: time })
      .catch(() => { message.edit({ content: `:x: Cancelled` }); return null; });
      // Disable the buttons locally
      for(button of row.components) {
        button.setDisabled(true);
      }
      // Disable the buttons for the users
      await message.edit({ content: content, components: [row] });
      setTimeout(() => {
        message.delete();
      }, 10000);
      // Return the button
      return res;
    },

      /**
       * @param {String} reason The message to send
       * @param {String} source Where the message originated from
       * @param {Interaction} interaction Interaction object, can be left blank
       * @param {Client} client Client object, cannot be left blank
       * @returns {null}
       * @example interactionToConsole(`Failed to remove ${channel} for\n\n${e}`, `index.js (Line 69)`, interaction, client)
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
            if(body) {
              body.toString();
            }
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

          if(source != `index.js (Line 87)`) await interaction.editReply({ content: `:fog: Something isn't right...`});
          if(source != `index.js (Line 87)`) interaction.followUp({ content: `My magic failed! Try to fix it on your own or contact my friends in the support server\n\n${reason}` });

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
       * @example interactionEmbed(1, `Removed ${removed} roles`, interaction, client, false)
       * @example interactionEmbed(3, `[ERR-UPRM]`, interaction, client, true)
       * @returns {null}
       */
      interactionEmbed: async function(type, content, interaction, client, ephemeral) {
        if(typeof type != 'number') return Promise.reject("type is not a number, " + `${type} ${content}`);
        if(type < 1 || type > 4) return Promise.reject("type is not a valid integer, " + `${type} ${content}`);
        if(typeof content != 'string') return Promise.reject("content is not a string, " + `${type} ${content}`);
        if(!interaction) return Promise.reject("interaction is a required argument, " + `${type} ${content}`);
        if(typeof interaction != 'object') return Promise.reject("interaction is not an object, " + `${type} ${content}`);
        if(!client) return Promise.reject("client is a required argument, " + `${type} ${content}`);
        if(typeof client != 'object') return Promise.reject("client is not an object, " + `${type} ${content}`);
        if(typeof ephemeral != 'boolean') return Promise.reject("ephemeral is a required argument, " + `${type} ${content}`);
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

            await interaction.editReply({ content: `My magic has worked and the result is below!`});
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

            await interaction.editReply({ content: `Oops! I couldn't cast my spell properly` });
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

            await interaction.editReply({ content: `Oh no! My magic backfired! Please let my friends in the support server know what happened or try to fix it on your own` });
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

            await interaction.editReply({ content: `Heyo, my magic gave me a little message to tell you!` });
            await interaction.followUp({ embeds: [embed], ephemeral: ephemeral })

            break;
        }
      }
};