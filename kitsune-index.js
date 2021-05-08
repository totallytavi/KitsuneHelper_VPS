const { Client, Collection } = require("discord.js");
const { errorMessage } = require('./functions.js');
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
/*
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
*/
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

client.login("Njk5NjcwODQ0MDgyNzQ5NDYx.XtI2-w.z5dH3fXJHAUaL8t2AsQ9zBFHhbc");


/////////////////////////////////////////
// Start Twitch bot code

const tmi = require('tmi.js');

const bot = new tmi.Client({
  options: { debug: true },
  connection: {
    secure: true,
    reconnect: true
  },
  identity: {
    username: 'Tavis_Helper',
    password: "7jx013x1q04m3b1b98p7ktp9xnuuoy" // Codertavi: zm9cwbo23812vwj9326mjfwyqhdn52
  },
  channels: [
    'Coder_Tavi',
    'ELT_JBone',
    'KitsuneHugs',
    'EyeOfSkaro',
    'Colvie_Channel',
    'bunnyzelda'
  ]
});

bot.connect();

bot.on('message', async (channel, tags, message, self) => {
  // Ignore echoed messages.
  if(self) return;

  console.log("C: " + channel)

  let allowViewers;
  fs.readFile("./allowViewers.txt", (err, data) => {
    allowViewers = data.toString()
  })
  console.log("AV: " + allowViewers)

if(channel === "#coder_tavi") {
  if(message.toLowerCase() === '!roblox') {
    bot.say(channel, `@${tags.username}, Tavi's ROBLOX username is TwistedNight38. I always leave joining on and FRs won't be accepted`);
  }
  if(message.toLowerCase() === '!join') {
    bot.say(channel, `@${tags.username}, hi! Tavi is ${allowViewers === "false" ? "not allowing viewers to join this stream, I'm sorry" : "allowing viewers to join. Please be patient and I will notify him you're interested"}`);
  }
}
if(tags.username.toLowerCase() === "coder_tavi") { // Owner only commands
  if(message.toLowerCase() === "!allowviewers") {
    fs.writeFile("./allowViewers.txt", "true", () => {
      bot.say(channel, `@${tags.username}, viewers are now allowed to join games!`)
    })
    client.channels.cache.get('840448163998728193').send("Stream updated to: `allowvViewers = true`")
  }
  if(message.toLowerCase() === "!declineviewers") {
    fs.writeFile("./allowViewers.txt", "false", () => {
      bot.say(channel, `@${tags.username}, viewers are now not allowed to join games!`)
    })
    client.channels.cache.get('840448163998728193').send("Stream updated to: `allowvViewers = false`")
  }
}
});