import { Client, Collection } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { interactionEmbed, toConsole } from "./functions.js";
import AsciiTable from "ascii-table";
import { bot, mysql as _mysql } from "./config.json";
import EventEmitter from "node:events";
import { writeFileSync, readdirSync } from "fs";
import { createConnection } from "mysql2/promise";
const rest = new REST({ version: 9 }).setToken(bot["token"]);
const wait = require("node:util").promisify(setTimeout);

// State that the process is not ready yet
let ready = false;

// Client initialization
const client = new Client({
  intents: ["GUILDS","GuildBans","GuildInvites","GuildMembers"]
});
const slashCommands = [];
client.commands = new Collection();
client.event = new EventEmitter();
(async () => {
  client.connection = await createConnection({
    host: _mysql["host"],
    user: _mysql["user"],
    password: _mysql["password"],
    database: _mysql["database"],
    port: _mysql["port"]
  });
})();

// Error logging
process.on("warning", async (name, message, stack) => {
  return toConsole("A [warning] has been emitted\n> Name: " + name + "\n> Message: " + message + "\n> Stack: " + stack, "process.on(\"warning\")", client);
});
process.on("unhandledRejection", async (promise) => {
  if(!ready) {
    console.error(promise);
    return process.exit(18);
  }
  return toConsole("A [unhandledRejection] has been emitted\n> Promise: " + promise, "process.on(\"unhandledRejection\")", client);
});
process.on("uncaughtException", async (err, origin) => {
  if(!ready) {
    console.error(err);
    return process.exit(17);
  }
  return toConsole("A [uncaughtException] has been emitted\n> Error: " + err + "\n> Origin: " + origin, "process.on(\"uncaughtException\")", client);
});
process.on("exit", async (code) => {
  return console.error("[EXIT] Process exited with code: " + code);
});

client.event.on("query", async (results, trace) => {
  const channel = client.channels.cache.get(bot["errorChannel"]);
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
  const data = `${JSON.stringify(Array.isArray(results) && results.length > 1 ? results[0] : "Results is not an array", null, 2)}\n===\n${table.toString()}`;

  if(channel === null) {
    writeFileSync(`./queries/${Date.now()}_query-log.txt`, data);
  } else {
    toConsole(data, `${__filename.split("/")[__filename.split("/").length - 1]} 80:16`, client);
  }
});

// Slash command registration
(async () => {
  const table = new AsciiTable("Commands");
  table.addRow("testing-file.js", "Loaded");
  const commands = readdirSync("./commands").filter(file => file.endsWith(".js"));
  console.info("[FILE-LOAD] Loading files, expecting " + commands.length + " files");

  for(let file of commands) {
    try {
      console.info("[FILE-LOAD] Loading file " + file);
      let command = require("./commands/" + file);

      if(command.name) {
        console.info("[FILE-LOAD] Loaded: " + file);
        slashCommands.push(command.data.toJSON());
        client.commands.set(command.name, command);
        table.addRow(command.name, "Loaded");
      }
    } catch(e) {
      console.info("[FILE-LOAD] Unloaded: " + file);
      console.info(`[FILE-LOAD] ${e.message}`);
      table.addRow(file, "Unloaded");
    }
  }

  console.info("[FILE-LOAD] All files loaded into ASCII and ready to be sent");
  await wait(500); // Artificial wait to prevent instant sending
  const now = Date.now();

  try {
    console.info("[APP-REFR] Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationCommands(bot["applicationId"]),
      { body: slashCommands },
    );
    
    const then = Date.now();
    console.info("[APP-REFR] Successfully reloaded application (/) commands after " + (then - now) + "ms.");
    console.info("[FILE-LOAD]\n" + table.toString());
  } catch(error) {
    toConsole("An error has occurred while attempting to refresh application commands.\n\n> " + error, __filename.split("/")[__filename.split("/").length - 1] + " 71:19", client);
    console.info("[FILE-LOAD]\n" + table.toString());
  }
  console.info("[FILE-LOAD] All files loaded successfully");
})();

// Client startup
client.on("ready", async (client) => {
  console.info("[READY] Client is ready");
  console.info("[READY] Setting presence for " + client.user.tag + " (" + client.user.id + ")");
  const presence = await client.user.setPresence({ activities: [{ name: client.user.username + " is starting up", type: "PLAYING" }], status: "online" });
  console.info("[READY] Set presence for " + client.user.tag + " (" + client.user.id + ") \n> Name: " + presence.activities[0].name + "\n> Type: " + presence.activities[0].type + "\n> Status: " + presence.status);
  ready = true;

  setInterval(async () => {
    const bans = await client.connection.execute("SELECT * FROM Bans WHERE duration <= ?", [Date.now()])
      .catch(e => console.info("[MYSQL] An error has occurred while attempting to check bans\n> " + e));
    for(let ban of bans[0]) {
      await client.connection.execute("DELETE FROM Bans WHERE banid = ?", [ban.banId]);
      ban = await client.guilds.cache.get(ban.guildId).then(g => {
        g.bans.fetch(ban.userId)
          .then(b => b.remove())
          .catch(() => { return null; });
      });
    }
    client.user.setPresence({ activities: [{ name: client.users.cache.size + " magicians across " + client.guilds.cache.size + " forests!", type: "LISTENING" }] });
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
    await wait(10000);
    await interaction.fetchReply()
      .then(m => {
        if(m.content === "" && m.embeds.length === 0) interactionEmbed(3, "[ERR-UNK]", "The command timed out and failed to reply in 10 seconds", interaction, client, false);
      });
  }
});

client.login(bot["token"]);
