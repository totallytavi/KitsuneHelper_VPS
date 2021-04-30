const { MessageEmbed } = require("discord.js");
const { errorMessage } = require('../../functions.js');
const cooldown = new Set();
const auth = new Set();

module.exports = {
    name: "eval",
    aliases: ['evaluate'],
    category: "fun",
    description: "Evaluates a script, restricted to authorized users only",
    usage: '<Discord.js>',
    timeout: "5 seconds",
    run: async (client, message, args) => {
      if (message.deletable) {
        message.delete();
      }
      if (cooldown.has(message.author.id)) {
        message.reply(`that's a little too fast!`).then(m => m.delete({ timeout: 2500 }));
      } else {
      auth.add('669051415074832397'); // Me
      auth.add('598457551457353728'); // Rei#8028

      if(!auth.has(message.author.id)) {
        return message.reply('kitsune leadership has not authorized you to do that!').then(m => m.delete({timeout: 5000}))
      }

      var script = args.slice(0).join(" ")
      if(script.includes('process.ENV.TOKEN')) return message.reply('hey! That is a private token!');
      if(script.includes('.token')) return message.reply('hey! That is a private token!');
      const embed = new MessageEmbed()
      .setTitle('Evaluation Script')
      .setDescription(`Input: \`\`\`js\n${script}\`\`\``)
      .setTimestamp();

      const dateNow = Date.now();
      message.channel.send(embed)

      try {
        const embed2 = new MessageEmbed()
        .setDescription(`Output: \`\`\`js\n${eval(script)}\`\`\``)
        .setTimestamp()
        const dateThen = Date.now()
        const time = dateThen - dateNow
        embed2.setFooter(`Execution time: ${time}ms`)
        message.channel.send(embed2)
      } catch(e) {
        const dateThen = Date.now()
        const time = dateThen - dateNow
        errorMessage(e, "eval command", message, client)
        return message.reply(`:x: Evaluation failed\n> Error: ${e}\n\nExecution time: ${time}ms`)
      }

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}