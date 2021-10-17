const config = require(`./config.json`)
const { Client, Collection } = require(`discord.js`);
const fs = require(`fs`);
const AsciiTable = require(`ascii-table`);
const { REST } = require(`@discordjs/rest`);
const rest = new REST({ version: 9 }).setToken(config.token);
const { Routes } = require(`discord-api-types/v9`);
const fetch = require(`fetch`).fetchUrl;
const wait = require(`util`).promisify(setTimeout);
const {  interactionToConsole, interactionEmbed } = require(`./functions.js`);
const { KSoftClient } = require(`@ksoft/api`);
const ksoft = new KSoftClient(config.ksoft)

const client = new Client({
  intents: [`GUILDS`,`GUILD_BANS`,`GUILD_EMOJIS_AND_STICKERS`,`GUILD_INVITES`,`GUILD_MEMBERS`,`GUILD_MESSAGES`,`GUILD_MESSAGE_REACTIONS`,`GUILD_MESSAGE_TYPING`,`GUILD_PRESENCES`,`GUILD_WEBHOOKS`]
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
      Routes.applicationGuildCommands(config.app_id, config.guild_id),
      { body: slashCommands },
      // Routes.applicationCommands(config.app_id),
      // { body: slashCommands },
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
  console.log(`[ACT-SET] Client is ready to receive data. Setting Presence`);
  const presence = await client.user.setPresence({ activities: [{ name: `${client.guilds.cache.size} servers and ${client.users.cache.size} users!`, type: `LISTENING` }], status: `online` })
  console.log(`[ACT-SET] The ClientUser's activity was set!\n> Name: ${presence.activities[0].name}\n> Type: ${presence.activities[0].type}\n> Status: ${presence.status}`)
    // .catch(error => toConsole(`[ACT-ERR] The ClientUser's activity was not set!\n> ${error}`, `index.js (Line 49)`, ``, client));
  
  setInterval(() => {
    client.user.setPresence({ activities: [{ name: `${client.guilds.cache.size} servers and ${client.users.cache.size} users!`, type: `LISTENING` }], status: `online` })
      // .catch(error => toConsole(`[ACT-ERR] The ClientUser's activity was not set!\n> ${error}`, `index.js (Line 54)`, ``, client));
  }, 20000);
})

client.on(`interactionCreate`, async (interaction) => {
  if(!interaction.inGuild()) return interactionEmbed(4, `[WARN-NODM]`, interaction, client, true);
  await interaction.deferReply();
  if(interaction.isCommand()) {
    let command = client.commands.get(interaction.commandName)
    if(command) {
      fetch("https://kitsunehelper.codertavi.repl.co/gbans.json", function(_e, _m, body) {
        const json = JSON.parse(body);
        if(json[interaction.user.id]) {
          interactionEmbed(4, `You are ${json[interaction.user.id].appealable === false ? `permanently banned` : `banned (appealable)`} for: ${json[interaction.user.id].reason}`, interaction, client, true)
        } else {
          command.run(client, interaction, interaction.options)
          interactionToConsole(`[TESTING] A user ran an interaction: ${interaction.commandName}`, `index.js (Line 81)`, interaction, client)
        }
      })
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

  const serverSettings = json[member.guild.id];
  if(serverSettings.banWithKSoft === true) {
    const ban = ksoft.bans.check(String(member.id));
    if(ban === true) {
      return member.ban({ reason: `Automatic ban due to a ban on KSoft.Si` });
    };
  };
});

client.login(config.token);