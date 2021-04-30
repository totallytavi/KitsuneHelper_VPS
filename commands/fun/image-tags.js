const { MessageEmbed } = require("discord.js");
const { KSoftClient } = require('@ksoft/api');
const cooldown = new Set();
const ksoft = new KSoftClient('108ef0b57311a44f3f9593996a2c2eaf8a87cff3');

module.exports = {
    name: "image-tags",
    category: "fun",
    description: "Provides the tags for the KSoft.Si Image API, helpful for the `image` command",
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {

      const all = `pepe, doge, kappa, dab, birb, dog, hentai, hentai_gif, fbi, neko, kiss, pat, hug, fox, lick, headrub, cat, clap, ass, tickle`
      const non = `pepe, doge, kappa, dab, birb, dog, fbi, kiss, pat, hug, fox, lick, headrub, cat, clap, tickle`
      const nsfw = `hentai, hentai_gif, neko, ass`

      const embed = new MessageEmbed()
      .setTitle('Tags')
      .setColor("RANDOM")
      .setDescription('Here is a list of the KSoft.Si Image API tags\nNote: The `neko` tag has non-NSFW images')
      .addFields(
        {name: 'All Tags', value: `${all}`, inline: true},
        {name: 'SFW Tags', value: `${non}`, inline: true},
        {name: 'NSFW Tags', value: `${nsfw}`, inline: true}
      )
      .setFooter(`${message.author.tag} requested this!`)
      .setTimestamp();

      message.channel.send(embed)

      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}
