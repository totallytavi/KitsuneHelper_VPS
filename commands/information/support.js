const { MessageEmbed, Message } = require("discord.js");
const { toConsole } = require('../../functions.js');
const cooldown = new Set();

module.exports = {
    name: "support",
    aliases: ['ineedhelp','helpme'],
    category: "information",
    description: "Provides a direct link to the support server",
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {

      const embed = new MessageEmbed()
      .setTitle('Support')
      .setThumbnail(client.user.avatarURL({dynamic: true, size: 2048}))
      .setDescription(`Need help? Don't worry! We have a server dedicated to receiving support with any issues you might have. You can join it [here](https://discord.com/invite/5WhRxzy 'Kitsune Helper support server')`)

      message.channel.send(embed)
      .catch(e => toConsole(e, "support.js (Line 24)", message, client))

      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}