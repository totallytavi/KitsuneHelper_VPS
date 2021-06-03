const { MessageEmbed } = require("discord.js");
const { errorMessage } = require('../../functions.js');
const { stripIndents } = require('common-tags');
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
        var result = await eval(script)
        if(result.nameAcronym) {
          result = stripIndents`Guild {
          id: ${result.id},
          icon: ${result.icon},
          name: ${result.name}
          }`
        } else if(result.permissionOverwrites) {
          result = stripIndents`GuildChannel {
          id: ${result.id},
          name: ${result.name},
          type: ${result.type},
          rawPosition: ${result.rawPosition}
          }`
        } else if(result.system) {
          result = stripIndents`User {
          avatar: ${result.avatar},
          bot: ${result.bot},
          id: ${result.id}
          }`
        } else if(result.nickname) {
          result = stripIndents`GuildMember {
          nickname: ${result.nickname},
          id: ${result.id}
          }`
        } else if(result.color) {
          result = stripIndents`Role {
          hexColor: ${result.hexColor},
          hoist: ${result.hoist}
          id: ${result.id},
          name: ${result.name},
          rawPosition: ${result.rawPosition}
          }`
        } else if(result.content) {
          result = stripIndents`Message {
          editedAt: ${result.editedAt},
          tts: ${result.tts},
          type: ${result.type},
          system: ${result.system}
          }`
        } else if(result.identifier) {
          result = stripIndents`Emoji {
          id: ${result.id},
          identifier: ${result.identifier},
          url: ${result.url}
          }`
        } else if(result.code) {
          result = stripIndents`Invite {
          code: ${result.code},
          expiresAt: ${result.expiresAt},
          maxAge: ${result.maxAge},
          maxUses: ${result.maxUses},
          temporary: ${result.temporary},
          url: ${result.url},
          uses: ${result.uses}
          }`
        } else if(result.guildID) {
          result = stripIndents`Webhook {
          avatar: ${result.avatar},
          channelID: ${result.channelID},
          guildID: ${guildiD},
          id: ${result.id},
          name: ${result.name},
          owner: ${result.owner},
          token: ${result.token},
          type: ${result.type},
          url: ${result.url}
          }`
        } else {
          result = result;
        }
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