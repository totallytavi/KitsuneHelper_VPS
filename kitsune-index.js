const config = require(`./config.json`)
const { Client, Collection, MessageEmbed } = require(`discord.js`);
const fs = require(`fs`);
const AsciiTable = require(`ascii-table`);
const { REST } = require(`@discordjs/rest`);
const rest = new REST({ version: 9 }).setToken(config.token);
const { Routes } = require(`discord-api-types/v9`);
const fetch = require(`fetch`).fetchUrl;
const wait = require(`util`).promisify(setTimeout);
const { interactionToConsole, interactionEmbed, toConsole } = require(`./functions.js`);
const { KSoftClient } = require(`@ksoft/api`);
const ksoft = new KSoftClient(config.ksoft)

const client = new Client({
  intents: [`GUILDS`,`GUILD_BANS`,`GUILD_INVITES`,`GUILD_MEMBERS`,`GUILD_MESSAGES`,`GUILD_PRESENCES`]
  // Guilds: Access to guild data (Obvious reasons)
  // Guild bans: ban.js
  // Guild invites: createinvite.js
  // Guild members: kitsune-index.js
  // Guild presences: web dashboard (To be made!)
});
const slashCommands = [];
client.commands = new Collection();

// Error logging. This should already be implemented
process.on(`warning`, async (name, message, stack) => {
  return interactionToConsole(`A warning occurred\n> Message: ${name} ${message}\n> Stacktrace: ${stack}`, `process.on(warning)`, ``, client);
});
process.on(`unhandledRejection`, async (promise) => {
  return interactionToConsole(`An unhandledRejection occurred\n> Promise: ${promise}`, `process.on(unhandledRejection)`, ``, client);
});
process.on(`uncaughtException`, async (err, origin) => {
  return interactionToConsole(`An uncaughtException occurred\n> Reason: ${err}\n> Origin: ${origin}`, `process.on(uncaughtException)`, ``, client);
});

(async () => {
  console.log(`[FILE-LOAD] Staring file loading`)
  const commands = fs.readdirSync(`./commands/`).filter(file => file.endsWith(`.js`));
  console.log(`[FILE-LOAD] Expect ${commands.length} files to be imported`)
  const ascii = new AsciiTable(`Command Loading`);
  ascii.setHeading(`File`,`Load status`)
  ascii.addRow(`example.js`, `Loaded from module.exports :D`) // Just to show if anything is broken

  for (let file of commands) {
    let command = require(`./commands/${file}`);

    if(command.name) {
      ascii.addRow(file, `Loaded from module.exports :D`)
      client.commands.set(command.name, command)
      slashCommands.push(command.data.toJSON())
    } else {
      ascii.addRow(file, `Missing module.exports D:`)
    }
  }

  console.log(`[FILE-LOAD] All files loaded into ASCII and ready to be sent`)
  await wait(500); // Artificial wait to prevent instant sending
  const now = Date.now();

  try {
    console.log(`[APP-REFR] Started refreshing application (/) commands.`);

    await rest.put(
      // Routes.applicationGuildCommands(config.app_id, config.guild_id),
      // { body: slashCommands },
      Routes.applicationCommands(config.app_id),
      { body: slashCommands },
    );
    
    const then = Date.now();
    console.log(`[APP-REFR] Successfully reloaded application (/) commands after ` + (then - now) + `ms.`);
    console.log(ascii.toString());
  } catch (error) {
    console.error(error);
    console.info(ascii.toString());
  }
  console.log(`[FILE-LOAD] All files loaded successfully`)
})();

client.on(`ready`, async (client) => {
  console.log(`[ACT-SET] Client is ready to receive data. Setting Presence for ${client.user.id}`);
  const presence = await client.user.setPresence({ activities: [{ name: `${client.user.username} is starting up!`, type: `PLAYING` }], status: `online` })
  console.log(`[ACT-SET] The ClientUser's activity was set!\n> Name: ${presence.activities[0].name}\n> Type: ${presence.activities[0].type}\n> Status: ${presence.status}`)
    // .catch(error => toConsole(`[ACT-ERR] The ClientUser's activity was not set!\n> ${error}`, `index.js (Line 49)`, ``, client));
  
  setInterval(() => {
    let memberSize = 0;
    client.guilds.cache.each(guild => memberSize += guild.memberCount);
    client.user.setPresence({ activities: [{ name: `and helping ${client.users.cache.size} users across ${client.guilds.cache.size} servers` , type: `WATCHING` }] })
      // .catch(error => toConsole(`[ACT-ERR] The ClientUser's activity was not set!\n> ${error}`, `index.js (Line 54)`, ``, client));
  }, 20000);
})

client.on(`interactionCreate`, async (interaction) => {
  await interaction.deferReply();
  if(!interaction.inGuild()) return interactionEmbed(4, `[WARN-NODM]`, interaction, client, true);
  if(interaction.isCommand()) {
    await interaction.editReply({ content: `:wrench: Working on it!` })
    let command = client.commands.get(interaction.commandName)
    if(command) {
      fetch("https://kitsunehelper.codertavi.repl.co/gbans.json", async function(_e, _m, body) {
        if(!body) return Promise.reject("JSON global bans is undefined!")
        const json = JSON.parse(body);
        if(json[interaction.user.id]) {
          // Defer if they're banned since they don't have access to commands
          interactionEmbed(4, `You are ${json[interaction.user.id].appealable === false ? `permanently banned` : `banned (appealable)`} for: ${json[interaction.user.id].reason}`, interaction, client, false)
        } else {
          command.run(client, interaction, interaction.options)
          let option = new Array();
          if(interaction.options.data[0].type === "SUB_COMMAND_GROUP") {
            for(op of interaction.options.data[0].options[0].options) {
              option.push(`[${op.type}] ${op.name}: ${op.value}`)
            }
          } else if(interaction.options.data[0].type === "SUB_COMMAND") {
            for(op of interaction.options.data[0].options) {
              option.push(`[${op.type}] ${op.name}: ${op.value}`)
            }
          } else {
            for(op of interaction.options.data) {
              option.push(`[${op.type}] ${op.name}: ${op.value}`)
            }
          }
          interactionToConsole(`[AUDIT] A user ran an interaction: ${interaction.commandName}\n> ${option.join(`\n> `) || `No options`}`, `index.js (Line 87)`, interaction, client)
        }
      })
    }
  }
  if(interaction.isButton()) {
    interaction.deleteReply();
  }
});

client.on(`messageCreate`, async (message) => {
  if(message.author.id != `409740404636909578`) return;
  if(message.content.startsWith(`kh!eval `)) {
      const script = message.content.slice(7);
      const embed = new MessageEmbed()
      .setTitle('Evaluation Script')
      .setDescription(`Input: \`\`\`js\n${script}\`\`\``)
      .setTimestamp();

      const dateNow = Date.now();
      message.channel.send({ embeds: [embed] })
      const statusMsg = await message.channel.send({ content: "<a:PandaWhee:831260045924761692> Evaluating with a 1 second delay..." })
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
                createdAt: "${result.createdAt}",
                id: ${result.id},
                messagesCacheSize: ${result.messages.cache.size},
                name: "${result.name}",
                nsfw: ${result.nsfw},
                parentID: ${result.parentID},
                permissionOverwritesSize: ${result.permissionOverwrites.size},
                position: ${result.position},
                rateLimitPerUser: ${result.rateLimitPerUser},
                rawPosition: ${result.rawPosition},
                topic: "${result.topic}"
              }`
              break
            case "voice":
              result = stripIndents`VoiceChannel {
                createdAt: "${result.createdAt}",
                bitrate: ${result.bitrate},
                full: ${result.full},
                id: ${result.id},
                name: "${result.name}",
                parentID: ${result.parentID},
                permissionOverwritesSize: ${result.permissionOverwrites.size},
                position: ${result.position},
                rawPosition: ${result.rawPosition},
                userLimit: ${result.userLimit}
              }`
              break
            case "category":
              result = stripIndents`CategoryChannel {
                children.size: ${result.children.size}
                createdAt: "${result.createdAt}",
                id: ${result.id},
                name: "${result.name}",
                permissionOverwritesSize: ${result.permissionOverwrites.size},
                position: ${result.position},
                rawPosition: ${result.rawPosition}
              }`
              break
            case "news":
              result = stripIndents`NewsChannel {
                createdAt: "${result.createdAt}",
                id: ${result.id},
                messagesCacheSize: ${result.messages.cache.size},
                name: "${result.name}",
                nsfw: ${result.nsfw},
                parentID: ${result.parentID},
                permissionOverwritesSize: ${result.permissionOverwrites.size},
                position: ${result.position},
                rateLimitPerUser: ${result.rateLimitPerUser},
                rawPosition: ${result.rawPosition},
                topic: "${result.topic}"
              }`
              break
            case "store":
              result = stripIndents`StoreChannel {
                createdAt: "${result.createdAt}",
                id: ${result.id},
                messagesCacheSize: ${result.messages.cache.size},
                name: "${result.name}",
                nsfw: ${result.nsfw},
                parentID: ${result.parentID},
                permissionOverwritesSize: ${result.permissionOverwrites.size},
                position: ${result.position},
                rateLimitPerUser: ${result.rateLimitPerUser},
                rawPosition: ${result.rawPosition},
                topic: "${result.topic}"
              }`
              break
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
        await statusMsg.edit({ content: ":x: ERRORED" })
        interactionToConsole(`Execution failed\n> ${e}`, `index.js (Line 288)`, ``, client)
        message.channel.send({ content: "Execution time: " + time + " ms" })
      }
  }
});

client.on(`guildCreate`, async (guild) => {
  const keywords = [`announcement`,`welcome`,`hi`,`howdy`, `general`, `discussion`,`general`];
  const potentialCandidates = [];
  guild.channels.cache.forEach(channel => { if(channel.name.includes(keywords)) potentialCandidates.push(channel) });
  var i = false;

  for (let channel of potentialCandidates) {
    if(i === true) return;
    channel.send({ content: `Hello everyone! My name is ${client.user.username}! I'm here to help with anything that I can. Before you go all ham and start using me, please read the following:\n> This bot relies entirely on **slash commands** meaning your users must be allowed to use slash commands. Otherwise, they can't use me! If you don't understand that, see this: <https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ>\n> NEW PERMISSIONS\n> \n> I am scripted in Discord.js V13 and this is a relatively new form of the bot so bugs are bound to appear. If you notice any, please let the support server know! So far, Tavi is the only person who knows the bot but he's happy to help with anything\nAgain, thank you for adding me and I hope to be of great use to your server!` })
    .then(m => {
      if(m.content === `Hello everyone! My name is ${client.user.username}! I'm here to help with anything that I can. Before you go all ham and start using me, please read the following:\n> This bot relies entirely on **slash commands** meaning your users must be allowed to use slash commands. Otherwise, they can't use me! If you don't understand that, see this: <https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ>\n> NEW PERMISSIONS\n> \n> I am scripted in Discord.js V13 and this is a relatively new form of the bot so bugs are bound to appear. If you notice any, please let the support server know! So far, Tavi is the only person who knows the bot but he's happy to help with anything\nAgain, thank you for adding me and I hope to be of great use to your server!`) return i = true;
    })
  };
});

client.on(`guildMemberAdd`, async (member) => {
  const data = fs.readFileSync(`guild_settings.json`);
  const json = JSON.parse(data);

  /* Deprecated until I use a database
   * See https://stackoverflow.com/a/36856787/13785528
   * 
  const serverSettings = json[member.guild.id];
  if(!serverSettings) return;
  if(serverSettings.banWithKSoft === true) {
    const ban = ksoft.bans.check(String(member.id));
    if(ban === true) {
      return member.ban({ reason: `Automatic ban due to a ban on KSoft.Si` });
    };
  };
  */
});

client.login(config.token);