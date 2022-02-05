const { Client, Collection } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { interactionEmbed, toConsole } = require("./functions.js");
const AsciiTable = require("ascii-table");
const config = require("./config.json");
const EventEmitter = require("events");
const fs = require("fs");
const mysql = require("mysql2/promise");
const rest = new REST({ version: 9 }).setToken(config.bot["token"]);
const wait = require("util").promisify(setTimeout);

// Client initialization
const client = new Client({
  intents: ["GUILDS","GUILD_BANS","GUILD_INVITES","GUILD_MEMBERS","GUILD_MESSAGES","GUILD_PRESENCES"]
});
const slashCommands = [];
client.commands = new Collection();
client.event = new EventEmitter();
(async () => {
  client.connection = await mysql.createConnection({
    host: config.mysql["host"],
    user: config.mysql["user"],
    password: config.mysql["password"],
    database: config.mysql["database"]
  });
})();

// Error logging
process.on("warning", async (name, message, stack) => {
  return toConsole("A [warning] has been emitted\n> Name: " + name + "\n> Message: " + message + "\n> Stack: " + stack, "process.on(\"warning\")", client);
});
process.on("unhandledRejection", async (promise) => {
  return toConsole("A [unhandledRejection] has been emitted\n> Promise: " + promise, "process.on(\"unhandledRejection\")", client);
});
process.on("uncaughtException", async (err, origin) => {
  return toConsole("A [uncaughtException] has been emitted\n> Error: " + err + "\n> Origin: " + origin, "process.on(\"uncaughtException\")", client);
});


client.event.on("query", async (results, trace) => {
  const channel = client.channels.cache.get(config.bot["errorChannel"]);
  const table = new AsciiTable("Query");
  table
    .setHeading("Property", "Value")
    .addRow("Source", trace ?? "? (No trace given)")
    .addRow("Rows Affected", results.affectedRows ?? "?")
    .addRow("Field Count", results.fieldCount ?? "?")
    .addRow("Insert ID", results.insertId ?? "?")
    .addRow("Server Status", results.serverStatus ?? "?")
    .addRow("Warning Status", results.warningStatus ?? "?")
    .addRow("Information", results.info === "" ? "No information" : results.info);
  const data = `${JSON.stringify(results[0], null, 2)}\n===\n${table.toString()}`;

  if(channel === null) {
    fs.writeFileSync(`./queries/${Date.now()}_query-log.txt`, data);
  } else {
    toConsole(data, `${__filename.split("/")[__filename.split("/").length - 1]} 80:16`, client);
  }
});

// Slash command registration
(async () => {
  const table = new AsciiTable("Commands");
  table.addRow("testing-file.js", "Loaded");
  const commands = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
  console.log("[FILE-LOAD] Loading files, expecting " + commands.length + " files");

  for(let file of commands) {
    try {
      console.log("[FILE-LOAD] Loading file " + file);
      let command = require("./commands/" + file);

      if(command.name) {
        console.info("[FILE-LOAD] Loaded: " + file);
        slashCommands.push(command.data.toJSON());
        client.commands.set(command.name, command);
        table.addRow(command.name, "Loaded");
      }
    } catch(e) {
      console.log("[FILE-LOAD] Unloaded: " + file);
      table.addRow(file, "Unloaded");
    }
  }

  console.log("[FILE-LOAD] All files loaded into ASCII and ready to be sent");
  await wait(500); // Artificial wait to prevent instant sending
  const now = Date.now();

  try {
    console.log("[APP-REFR] Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(config.bot["applicationId"], config.bot["devGuildId"]),
      { body: slashCommands },
    );
    
    const then = Date.now();
    console.log("[APP-REFR] Successfully reloaded application (/) commands after " + (then - now) + "ms.");
    console.log(table.toString());
  } catch(error) {
    toConsole("An error has occurred while attempting to refresh application commands.\n\n> " + error, __filename.split("/")[__filename.split("/").length - 1] + " 71:19", client);
    console.info(table.toString());
  }
  console.log("[FILE-LOAD] All files loaded successfully");
})();

// Client startup
client.on("ready", async (client) => {
  console.log("[READY] Client is ready");
  console.info("[READY] Setting presence for " + client.user.tag + " (" + client.user.id + ")");
  const presence = await client.user.setPresence({ activities: [{ name: client.user.username + " is starting up", type: "PLAYING" }], status: "online" });
  console.info("[READY] Set presence for " + client.user.tag + " (" + client.user.id + ") \n> Name: " + presence.activities[0].name + "\n> Type: " + presence.activities[0].type + "\n> Status: " + presence.status);
  
  setInterval(async () => {
    client.connection.end(); // Stop the connection from taking more requests
    let memberSize = 0;
    client.guilds.cache.each(guild => memberSize += guild.memberCount);
    client.user.setPresence({ activities: [{ name: client.users.cache.size + " magicians across " + client.guilds.cache.size + " forests!", type: "LISTENING" }] });
    client.connection = await mysql.createConnection({
      host: config.mysql["host"],
      user: config.mysql["user"],
      password: config.mysql["password"],
      database: config.mysql["database"]
    });
  }, 30000);
});

// Client event handling
client.on("interactionCreate", async (interaction) => {
  await interaction.deferReply();
  if(interaction.user.bot) return;
  if(!interaction.inGuild()) return interactionEmbed(4, "[WARN-NODM]", "", interaction, client, true);
  if(interaction.isCommand()) {
    let command = client.commands.get(interaction.commandName);
    if(command) {
      command.run(client, interaction, interaction.options);
    }
  }
});

client.login(config.bot["token"]);