const { errorMessage, errorEmbed } = require("../../functions.js");
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "clear",
    aliases: ["purge", "clean"],
    category: "general management",
    description: "Purges an amount of messages",
    usage: '<1-100>',
    timeout: "5 seconds",
    run: async (client, message, args) => {
        if (message.deletable) {
            message.delete();
        }
        if(cooldown.has(message.author.id)) {
          return message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
        } else {
        auth.add("669051415074832397")

        if(message.member.hasPermission("MANAGE_MESSAGES")) {
          auth.add(message.author.id)
        }
        if(!auth.has(message.author.id)) {
          return message.reply('kitsune leadership has not allowed to do that!').then(m => m.delete({timeout: 5000}))
        }
        if(!message.guild.me.hasPermission("MANAGE_MESSAGES") && !message.channel.permissions.has("MANAGE_MESSAGES")) {
          const response = await errorEmbed("Insufficient permissions: I cannot manage messages", message)
          return message.reply(response)
        }

        // Check if args[0] is a number
        if (isNaN(args[0]) || parseInt(args[0]) <= 0) {
          const response = await errorEmbed("Bad usage: Number to purge is not an integer (Limit: 1-100)", message)
          return message.reply(response)
        }

        let deleteAmount;

        if (parseInt(args[0]) > 100) {
            deleteAmount = 100;
        } else {
            deleteAmount = parseInt(args[0]);
        }

        setTimeout(() => {
          message.channel.bulkDelete(deleteAmount, true)
            .then(messages => message.channel.send(`:broom: Sweep! \`${messages.size}\` messages were removed`))
            .then(m => m.delete({timeout: 5000}))
        }, 500)

        auth.delete(message.author.id)
        cooldown.add(message.author.id);
        setTimeout(() => {
          cooldown.delete(message.author.id);
        }, 5000);
      }
    }
}
