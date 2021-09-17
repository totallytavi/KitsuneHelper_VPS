const { Client, Collection } = require("discord.js");
const { toConsole, responseEmbed } = require('./functions.js');
const fetch = require('node-fetch');
const fs = require("fs");
// to lowercase

fetch("https://checkip.amazonaws.com")
  .then(res => res.text())
  .then(body => {
    console.log("This script's IP is: " + body + ". If this does not match with the public IP, node-fetch is not working")
  })

const client = new Client({
    disableEveryone: true,
    partials: ['GUILD_MEMBER'],
    intents: ['GUILDS','GUILD_BANS','GUILD_EMOJIS_AND_STICKERS','GUILD_INVITES','GUILD_MEMBERS','GUILD_MESSAGES','GUILD_MESSAGE_REACTIONS','GUILD_PRESENCES']
});
/** {DO NOT PLACE TEXT ABOVE THIS LINE} **/

client.commands = new Collection();
client.aliases = new Collection();

client.categories = fs.readdirSync("./commands/");

// Begin SlashCmd code

// Not using it until I roll out FULL support

// End SlashCmd code
// Begin Sequelize code

const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'root', '8Ow8Um*Qj4UF#Uv2qxdG', {
	host: '64.52.85.122',
	dialect: 'sqlite',
	logging: true,
	storage: 'database.sqlite',
});

// End Sequelize code

// Literally just a big fat cmd watcher
process.on('unhandledRejection', async promise => {
  console.log(`**A promise was rejected!\n\n${promise}`)
  toConsole(String(promise), `Unhandled promise rejection`, '', client)
});
process.on('exit', async code => {
  console.log(`**PROCESS EXITING\n\nWARNING: The process is exiting!\nCode: ${code}`)
  toConsole(String(code), `Process exit`, '', client)
});
process.on('warning', async (name, message, stack) => {
  console.log(`**Warning\n\nName: ${name}\nMessage: ${message}\nStack trace to file: ${stack}`)
  toConsole(String(name), `Process warning`, '', client)
});
process.on('uncaughtException', (err, origin) => {
  console.log(`**Uncaught exception!\n\nError: ${err}\nOrigin: ${origin}`)
  toConsole(String(err), `Uncaught exception`, '', client)
});

["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.on("ready", async () => {
    console.log(`I am interacting with ${client.guilds.cache.size} guilds. Wooow!`)
    console.log(`${client.user.username} is now online!`);

    client.user.setActivity(`kitsune leadership on ${client.guilds.cache.size} servers • kh!commands`, { type: 'LISTENING' })
      .then(presence => console.log(`Activity set to \n \n Type: ${presence.activities[0].type} \n Text: ${presence.activities[0].name}`))
      .catch(console.error);

    process.emitWarning('Custom status set!', 'Custom Status');

    setInterval(() => {
      client.user.setActivity(`kitsune leadership on ${client.guilds.cache.size} servers • kh!commands`, { type: 'LISTENING' })
        .catch(console.error);
    }, 20000);
});

console.log(`Random string check: ${[...Array(30)].map(i=>(~~(Math.random()*36)).toString(36)).join('')}`)

client.on("message", async message => {
    const prefix = "kh!";

    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.toLowerCase().startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command)
      if(!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return message.author.send("I require the \`SEND MESSAGES\` permission in that channel!")
      if(!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send("I require the \`EMBED LINKS\` permission in this channnel!")
      toConsole(`**Command ran**\n> Command: ${cmd}\n> Arguments: ${args.slice(0).join(" ")}`, "index.js (Line 97)", message, client)
      command.run(client, message, args);

});

client.on('interactionCreate', async (interaction) => {
  if(interaction.isCommand()) {
    let command = client.commands.get(interaction.commandName)
    if (!command) command = client.commands.get(client.aliases.get(interaction.commandName))

    if(command) {
      toConsole(`**Interaction ran**\n> Interaction: ${interaction.commandName}\n> Options: ${String(interaction.options)}`, "index.js (Line 132)", '', client)
      command.execute(client, interaction);
    }
  }
});


client.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();

  const member = reaction.message.guild.members.cache.find(member => member.user === user)
  if(member.user.bot) return;

  /**
   * TEMPLATE FOR REACTION ROLES
   * Follow this whenever you are creating a reaction role
   * Anything with <> around it is a placeholder, remove these
   * when substituting variables in
   * 
   * if(reaction.emoji.id === "<ID of emoji>" && reaction.message.id == "<ID of message>") member.roles.add(['<ID of role>']) // <Name of role>
   */

  if(reaction.emoji.id === "861998770773295144" && reaction.message.id == "861998149853642772") member.roles.add(['862035778444197938']) // DoL Gamemaster
  if(reaction.emoji.id === "861998770773295144" && reaction.message.id == "862083724559515648") member.roles.add(['861608781880492062']) // NSFW
})

client.on("messageReactionRemove", async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();

  const member = reaction.message.guild.members.cache.find(member => member.user === user)
  if(member.user.bot) return;

  if(reaction.emoji.id === "861998770773295144" && reaction.message.id == "861998149853642772") member.roles.remove(['862035778444197938']) // DoL Gamemaster
  if(reaction.emoji.id === "861998770773295144" && reaction.message.id == "862083724559515648") member.roles.remove(['861608781880492062']) // NSFW
})

client.login("Njk5NjcwODQ0MDgyNzQ5NDYx.XpXxQA.5mGVwYPEIOmHQIR0UOkqLHzUi7A");