const { Client, Collection, Presence } = require(`discord.js`);
const fs = require(`fs`);
const { REST } = require(`@discordjs/rest`);
const rest = new REST({ version: 9 }).setToken(`Njk5NjcwODQ0MDgyNzQ5NDYx.XpXxQA.5mGVwYPEIOmHQIR0UOkqLHzUi7A`);
const { Routes } = require(`discord-api-types/v9`);
const wait = require('util').promisify(setTimeout);
const { toConsole, interactionToConsole } = require(`./functions.js`);

const client = new Client({
  intents: [`GUILDS`,`GUILD_BANS`,`GUILD_EMOJIS_AND_STICKERS`,`GUILD_INVITES`,`GUILD_MEMBERS`,`GUILD_MESSAGES`,`GUILD_MESSAGE_REACTIONS`,`GUILD_MESSAGE_TYPING`,`GUILD_PRESENCES`,`GUILD_WEBHOOKS`]
});
const slashCommands = []; client.commands = new Collection();

fs.readdirSync(`./commands/`).forEach(async (dir, index, array) => {
  const commands = fs.readdirSync(`./commands/${dir}`).filter(file => file.endsWith(`.js`));

  for (let file of commands) {
    let command = require(`./commands/${dir}/${file}`);

    if(command.name) {
      console.info(`[FILE-LOAD] Loaded: ${command.name} from ${file}!`)
      client.commands.set(command.name, command)
      slashCommands.push(command.data.toJSON())
    } else {
      console.info(`[FILE-LOAD] Failed to load: ${file}! Did you forget to add a name property in module.exports?`)
    }
  }

  await wait(500); // Artificial wait to prevent instant sending
  const now = Date.now();

  try {
    if(index < array.length - 1) return console.log(`[APP-REFR] The refresh was called too early!`)
    console.log(`[APP-REFR] Started refreshing application (/) commands.`);

    await rest.put(
      Routes.applicationCommands(`699670844082749461`),
      { body: slashCommands },
    );
    
    const then = Date.now();
    console.log(`[APP-REFR] Successfully reloaded application (/) commands after ` + (then - now) + `ms.`);
  } catch (error) {
    console.error(error);
  }
});

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
  if(interaction.type === `APPLICATION_COMMAND`) {
    interaction.deferReply(); // Defer right away so Discord won't break.
    let command = client.commands.get(interaction.commandName)
    if(command) {
      command.run(client, interaction, interaction.options)
      interactionToConsole(`A user ran an interaction: ${interaction.commandName}`, `index.js (Line 81)`, interaction, client)
    }
  }
});

client.on(`guildCreate`, async (guild) => {
  const keywords = [`announcement`,`welcome`,`hi`,`howdy`, `general`, `discussion`];
  const potentialCandidates = [];
  guild.channels.cache.forEach(channel => { if(channel.name.includes(keywords)) potentialCandidates.push(channel) });
  var i = false;

  for (let channel of potentialCandidates) {
    if(i === true) return;
    channel.send({ content: `Hello everyone! My name is ${client.user.username}! I'm here to help with anything that I can. Before you go all ham and start using me, please read the following:\n> This bot relies entirely on **slash commands** meaning your users must be allowed to use slash commands. Otherwise, they can't use me! If you don't understand that, see this: <https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ> -\> NEW PERMISSIONS\n> \n> I am scripted in Discord.js V13 and this is a relatively new form of the bot so bugs are bound to appear. If you notice any, please let the support server know! So far, Tavi is the only person who knows the bot but he's happy to help with anything\nAgain, thank you for adding me and I hope to be of great use to your server!` })
    .then(m => {
      if(m.content === `Hello everyone! My name is ${client.user.username}! I'm here to help with anything that I can. Before you go all ham and start using me, please read the following:\n> This bot relies entirely on **slash commands** meaning your users must be allowed to use slash commands. Otherwise, they can't use me! If you don't understand that, see this: <https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ> -\> NEW PERMISSIONS\n> \n> I am scripted in Discord.js V13 and this is a relatively new form of the bot so bugs are bound to appear. If you notice any, please let the support server know! So far, Tavi is the only person who knows the bot but he's happy to help with anything\nAgain, thank you for adding me and I hope to be of great use to your server!`) return i = true;
    })
  };
});

client.login(`Njk5NjcwODQ0MDgyNzQ5NDYx.XpXxQA.5mGVwYPEIOmHQIR0UOkqLHzUi7A`);