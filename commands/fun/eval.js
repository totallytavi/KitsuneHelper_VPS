const { MessageEmbed } = require("discord.js");
const { errorMessage } = require('../../functions.js');
const wait = require('util').promisify(setTimeout);
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
      const statusMsg = await message.channel.send("<a:PandaWhee:831260045924761692> Evaluating with a 1 second delay...")
      await wait(1000)

      try {
        const result = await eval(script)
        const dateThen = Date.now()
        const time = dateThen - dateNow
        await statusMsg.edit(`\`\`\`js\n${result}\`\`\`\nExecution time: ${time} ms`)
      } catch(e) {
        const dateThen = Date.now()
        const time = dateThen - dateNow
        errorMessage(e, "eval command", message, client)
        message.channel.send("Execution time: " + time + " ms")
      }

      auth.delete(message.author.id)
      cooldown.add(message.author.id);
      setTimeout(() => {
        cooldown.delete(message.author.id);
      }, 5000);
    }
  }
}