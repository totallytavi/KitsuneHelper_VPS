const { Client, Collection } = require("discord.js");
const { toConsole } = require('./functions.js');
const fetch = require('node-fetch');
const fs = require("fs");
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3')
// to lowercase

fetch("https://checkip.amazonaws.com")
  .then(res => res.text())
  .then(body => {
    console.log("This script's IP is: " + body + ". If this does not match with the public IP, node-fetch is not working")
  })

sqlite.open({ filename: 'Moderations.db', driver: sqlite3.Database })
.then(db => {
  console.log("The current database is: " + db + ". If this does not show Moderations.db, sqlite/sqlite3 is not working properly")
})

const client = new Client({
    disableEveryone: true,
    partials: ['GUILD_MEMBER']
});
/** {DO NOT PLACE TEXT ABOVE THIS LINE} **/

client.commands = new Collection();
client.aliases = new Collection();

client.categories = fs.readdirSync("./commands/");

// Literally just a big fat cmd watcher
process.on('unhandledRejection', async promise => {
  console.log(`**A promise was rejected!\n\n${promise}`)
  toConsole(promise, `Unhandled promise rejection`, '', client)
});
process.on('exit', async code => {
  console.log(`**PROCESS EXITING\n\nWARNING: The process is exiting!\nCode: ${code}`)
  toConsole(code, `Process exit`, '', client)
});
process.on('warning', async (name, message, stack) => {
  console.log(`**Warning\n\nName: ${name}\nMessage: ${message}\nStack trace to file: ${stack}`)
  toConsole(name, `Process warning`, '', client)
});
process.on('uncaughtException', (err, origin) => {
  console.log(`**Uncaught exception!\n\nError: ${err}\nOrigin: ${origin}`)
  toConsole(err, `Uncaught exception`, '', client)
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
      toConsole(`Command ran\n> Command: ${cmd}\n> Arguments: ${args.slice(0).join(" ")}`, "index.js (Line 97)", message, client)
      command.run(client, message, args);

});

client.login("Njk5NjcwODQ0MDgyNzQ5NDYx.XtI2-w.z5dH3fXJHAUaL8t2AsQ9zBFHhbc");