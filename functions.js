const { MessageEmbed } = require("discord.js");

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
     * @param {Error|TypeError|string} e The error. Typically an Error or string
     * @param {string} cmd The source of the error
     * @param {Message} message The Message object to gather information from
     * @param {Client} client Required for the command to send a message to the error log
     */
    errorMessage: async function (e, cmd, message, client) { // I hate needing to pass in the message + client
        if(message) {
          if(cmd != "index.js (Line 97)") {
            // Basic error message
            message.channel.send(`:x: Error alert! Contact the support server (Found with \`kh!support\`) or fix it if you know what to do\n${e}`)
          }

        // Channel and embed
        const errorLog = client.channels.cache.find(c => c.id === "775560270700347432")
        if(!errorLog) return console.log("errorLog was not found. Aborting error log")
        const embed = new MessageEmbed()
        .setTitle("Error Alert")
        .setColor("RED")
        .addFields(
            { name: "Source", value: `${cmd}`, inline: true },
            { name: "Author", value: `${message.author}`, inline: true },
            { name: "Error", value: `${e}`, inline: true }
        )
        .setFooter(`${message.guild.name}`, `${message.guild.iconURL({dynamic: true, size: 2048})}`)
        .setTimestamp();

        errorLog.send(embed)
        } else {
        // Channel and embed
        const errorLog = client.channels.cache.find(c => c.id === "775560270700347432")
        if(!errorLog) return console.log("errorLog was not found. Aborting error log")
        const embed = new MessageEmbed()
        .setTitle("Error Alert")
        .setColor("RED")
        .addFields(
            { name: "Source", value: `${cmd}`, inline: true },
            { name: "Author", value: `Unknown`, inline: true },
            { name: "Error", value: `${e}`, inline: true }
        )
        .setFooter(`Unknown guild`)
        .setTimestamp();

        if(cmd === "Process exit") {
          errorLog.send(`||@everyone|| Process is exiting!`, embed)
        } else {
          errorLog.send(`Unknown guild has triggered an issue!`, embed)
        }
        }
    },

    /**
     * @param {string} issue The issue with running the command
     * @param {Message} message A Message object
     * @returns MessageEmbed A MessageEmbed with the issue
     */
    errorEmbed: async function (issue, message) {
        if(!issue || issue === "") {
            return;
        }

        const response = new MessageEmbed()
        .setAuthor(message.author.tag)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setTitle("Error")
        .setColor("RED")
        .setDescription(`${issue}`)
        .setTimestamp();

        return response;
    }
};