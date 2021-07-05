const { MessageEmbed } = require("discord.js");
const { toConsole } = require('../../functions.js');
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
      auth.add('409740404636909578'); // Me
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
        if(!result) result = "No value returned"
        if(result.approximateMemberCount) {
          result = stripIndents`Guild {
          id: ${result.id},
          icon: ${result.icon},
          name: ${result.name}
          }`
        } else if(result.permissionOverwrites) {
          switch(result.type) {
            case "text":
              result = stripIndents`TextChannel {
                createdAt: ${result.createdAt},
                id: ${result.id},
                messages.cache.size: ${result.messsages.cache.size},
                name: "${result.name}",
                nsfw: ${result.nsfw},
                parentID: ${result.parentID},
                permissionOverwrites.size: ${result.permissionOverwrites.size},
                position: ${result.position},
                rateLimitPerUser: ${result.rateLimitPerUser},
                rawPosition: ${result.rawPosition},
                topic: "${result.topic}"
              }`
            case "voice":
              result = stripIndents`VoiceChannel {
                createdAt: ${result.createdAt},
                bitrate: ${result.bitrate},
                full: ${result.full},
                id: ${result.id},
                name: "${result.name}",
                parentID: ${result.parentID},
                permissionOverwrites.size: ${result.permissionOverwrites.size},
                position: ${result.position},
                rawPosition: ${result.rawPosition},
                userLimit: ${result.userLimit}
              }`
            case "category":
              result = stripIndents`CategoryChannel {
                children.size: ${result.children.size}
                createdAt: ${result.createdAt},
                id: ${result.id},
                name: "${result.name}",
                permissionOverwrites.size: ${result.permissionOverwrites.size}
                position: ${result.position},
                rawPosition: ${result.rawPosition}
              }`
            case "news":
              result = stripIndents`NewsChannel {
                createdAt: ${result.createdAt},
                id: ${result.id},
                messages.cache.size: ${result.messsages.cache.size},
                name: "${result.name}",
                nsfw: ${result.nsfw},
                parentID: ${result.parentID},
                permissionOverwrites.size: ${result.permissionOverwrites.size},
                position: ${result.position},
                rateLimitPerUser: ${result.rateLimitPerUser},
                rawPosition: ${result.rawPosition},
                topic: "${result.topic}"
              }`
            case "store":
              result = stripIndents`StoreChannel {
                createdAt: ${result.createdAt},
                id: ${result.id},
                messages.cache.size: ${result.messsages.cache.size},
                name: "${result.name}",
                nsfw: ${result.nsfw},
                parentID: ${result.parentID},
                permissionOverwrites.size: ${result.permissionOverwrites.size},
                position: ${result.position},
                rateLimitPerUser: ${result.rateLimitPerUser},
                rawPosition: ${result.rawPosition},
                topic: "${result.topic}"
              }`
          }
        } else if(result.bot) {
          result = stripIndents`User {
          avatar: ${result.avatarURL({ dynamic: true, size: 2048 })},
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
          content: ${result.content.slice(0, 99)},
          editedAt: ${result.editedAt},
          id: ${result.id},
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
        await statusMsg.edit(":x: ERRORED")
        toConsole(String(e), "eval.js (Line 43, but mainly the try loop)", message, client)
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