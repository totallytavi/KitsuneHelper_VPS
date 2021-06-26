const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { toConsole, responseEmbed } = require('../../functions.js');
const cooldown = new Set();

module.exports = {
    name: "color",
    aliases: ['hex'],
    category: "fun",
    description: "Provides an embed with the color given, or a random one if not provided",
    usage: '<6-character hex code | Discord.js color value>',
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {

      // Check the input for valid input
      var color = args[0];
      var hexRegex = /^#[0-9A-F]{6}$/i
      var jsColorRegex = ["DEFAULT","WHITE","AQUA","GREEN","BLUE","YELLOW","PURPLE","LUMINOUS_VIVID_PINK","GOLD","ORANGE","RED","GREY",
      "DARKER_GREY","NAVY","DARK_AQUA","DARK_GREEN","DARK_BLUE","DARK_PURPLE","DARK_VIVID_PINK","DARK_GOLD","DARK_ORANGE","DARK_RED",
      "DARK_GREY","LIGHT_GREY","DARK_NAVY","BLURPLE","GREYPLE","DARK_BUT_NOT_BLACK","NOT_QUITE_BLACK"]
      if(!hexRegex.test(color) && jsColorRegex.indexOf(color) === -1) return responseEmbed(3, "Bad Usage: You must supply a hex code or Discord.js color code", "CHANNEL", message, client)

      const embed = new MessageEmbed()
      .setTitle("Color")
      .setColor(color)
      .setDescription(stripIndents`On the left side of this embed is a small strip
      This contains the color that you chose
      The color code chosen was: ${color}
      If this isn't right, or you want to try a different one
      Just run the command again!`)
      .setTimestamp();

      message.channel.send(embed)
      .catch(e => toConsole(String(e), "color.js (Line 39)", message, client));

      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}