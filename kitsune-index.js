const { Client, Collection } = require("discord.js");
const { errorMessage } = require('./functions.js');
const { config } = require("dotenv");
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
// to lowercase

const client = new Client({
    disableEveryone: true,
    partials: ['GUILD_MEMBER']
});
/** {DO NOT PLACE TEXT ABOVE THIS LINE} **/

client['db'] = "nothing. this should not happen";

(async () => {
    return client['db'] = await open({
      filename: './sqlite3_databases/Moderations.db',
      driver: sqlite3.Database
    }).catch(e => console.log("kitsune-index.js -- SQLite3 load failed: " + e));
})()
console.log("The current database is: " + client.db.toString())

client.commands = new Collection();
client.aliases = new Collection();

client.categories = fs.readdirSync("./commands/");

// Literally just a big fat cmd watcher
process.on('unhandledRejection', async promise => {
  console.log(`**A promise was rejected!\n\n${promise}`)
  errorMessage(promise, `Unhandled promise rejection`, '', client)
});
process.on('exit', async code => {
  console.log(`**PROCESS EXITING\n\nWARNING: The process is exiting!\nCode: ${code}`)
  errorMessage(code, `Process exit`, '', client)
});
process.on('warning', async (name, message, stack) => {
  console.log(`**Warning\n\nName: ${name}\nMessage: ${message}\nStack trace to file: ${stack}`)
  errorMessage(name, `Process warning`, '', client)
});
process.on('uncaughtException', (err, origin) => {
  console.log(`**Uncaught exception!\n\nError: ${err}\nOrigin: ${origin}`)
  errorMessage(err, `Uncaught exception`, '', client)
});

config({
    path: __dirname + "/.env"
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
      
      console.log("\n-- Starting SQLite mute test!")
      client.guilds.cache.each(guild => {
        client.db.each("SELECT * FROM mutes WHERE unmute_date<=$currentDate AND guild_id=$gid", {
          $currentDate: Date.now(),
          $gid: guild.id
        }, result => console.log("Mute SQLite3 results: " + result))
      })
      console.log("-- Ended SQLite mute test!\n")
    }, 20000);
});

console.log(`Random string check: ${[...Array(30)].map(i=>(~~(Math.random()*36)).toString(36)).join('')}`)

client.on("message", async message => {
    const prefix = "kh!";

    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command)
      errorMessage(`Command ran\n> Command: ${cmd}\n> Arguments: ${args.slice(0).join(" ")}`, "index.js (Line 79)", message, client)
      command.run(client, message, args);

});

client.on("guildCreate", async guild => {
  console.log(`\n[GUILD_CREATE] Added to ${guild.name}\n\n`)
  client.user.setActivity(`kitsune leadership on ${client.guilds.cache.size} servers • kh!commands`, { type: 'LISTENING' })
    .catch(console.error);
})

client.login(process.env.TOKEN);

// db.close(result => console.log("ON DATABASE CLOSE--\n" + result));
