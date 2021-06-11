const { errorMessage, errorEmbed, responseEmbed, toConsole } = require("../../functions.js");
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
        if(!auth.has(message.author.id)) return responseEmbed(3, "Unauthorized: You don't have MANAGE MESSAGES", "CHANNEL", message, client)
        if(!message.guild.me.hasPermission("MANAGE_MESSAGES")) return responseEmbed(3, "Unauthorized: I don't have MANAGE MESSAGES", "CHANNEL", message, client)

        // Check if args[0] is a number
        if (isNaN(args[0]) || parseInt(args[0]) <= 0) return responseEmbed(3, "Bad Usage: You must supply a number to purge", "CHANNEL", message, client)

        let deleteAmount;

        if (parseInt(args[0]) > 100) {
          deleteAmount = 100;
        } else {
          deleteAmount = parseInt(args[0]);
        }

        setTimeout(() => {
          message.channel.bulkDelete(deleteAmount, true)
            .then(messages => responseEmbed(1, "Sweep! " + messages.size + " messages were deleted!"))
            .catch(e => toConsole(e, "clear.js (Line 39)", message, client))
        }, 500)

        auth.delete(message.author.id)
        cooldown.add(message.author.id);
        setTimeout(() => {
          cooldown.delete(message.author.id);
        }, 5000);
      }
    }
}
