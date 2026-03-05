import { ActivityType, Client, Collection, GatewayIntentBits, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import { readdirSync } from "node:fs";
import { Op, Sequelize } from "sequelize";
import { default as config } from "../config.json" with { "type": "json" };
import { initModels } from "./models/init-models.js";
import { interactionEmbed, toConsole } from "./functions.js";
import { KitsuneClient } from "./types.js";
const { bot, mysql } = config
const wait = (await import("node:util")).promisify(setTimeout);

// State that the process is not ready yet
let ready = false;

// @ts-expect-error
const client: KitsuneClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers
  ]
});

// Error logging
process.on("warning", async (name: string, message: string, stack: string) => {
  return toConsole("A [warning] has been emitted\n> Name: " + name + "\n> Message: " + message + "\n> Stack: " + stack, "process.on(\"warning\")", client);
});
process.on("unhandledRejection", async (promise: PromiseRejectedResult) => {
  if(!ready) {
    console.error(promise);
    return process.exit(18);
  }
  return toConsole("A [unhandledRejection] has been emitted\n> Promise: " + promise, "process.on(\"unhandledRejection\")", client);
});
process.on("uncaughtException", async (err: Error, origin: string) => {
  if(!ready) {
    console.error(err);
    return process.exit(17);
  }
  return toConsole("A [uncaughtException] has been emitted\n> Error: " + err + "\n> Origin: " + origin, "process.on(\"uncaughtException\")", client);
});
process.on("exit", async (code) => {
  return console.error("[EXIT] Process exited with code: " + code);
});

const sequelize = new Sequelize(mysql["database"], mysql["user"], mysql["password"], {
  host: mysql["host"],
  port: mysql["port"],
  dialect: "mysql"
});
(async () => {
  // @ts-ignore
  await sequelize.authenticate();
  await sequelize.sync({
    alter: process.env.NODE_ENV === "development"
  });
})();

client.models = initModels(sequelize);

const slashCommands = [] as RESTPostAPIChatInputApplicationCommandsJSONBody[];
// @ts-ignore
client.commands = new Collection();

const commands = readdirSync("./commands").filter(file => file.endsWith(".js"));
console.info("[FILE-LOAD] Loading files, expecting " + commands.length + " files");

for(let file of commands) {
  try {
    let command = await import("./commands/" + file);

    if(command.name) {
      console.info("[FILE-LOAD] Loaded: " + file);
      slashCommands.push(command.data.toJSON());
      // @ts-ignore
      client.commands.set(command.name, command);
      console.debug(`[✓] Loaded command ${command.name} from file ${file}`);
    }
  } catch(e: unknown) {
    console.error(`[X] Failed to load command from file ${file}\n> Error: ${e}`);
  }
}

const events = readdirSync("./events");
console.info("[EVENT-LOAD] Loading events, expecting " + events.length + " events");
for (const eventName of events) {
  for (const file of readdirSync(`./events/${eventName}`).filter((f) => f.endsWith('.js'))) {
    try {
      const handler = await import(`./events/${eventName}/${file}`);
  
      client.on(eventName, (...args) => handler.run(client, args));
      console.info(`[EVENT-LOAD] Done loading ./events/${eventName}/${file}`)
    } catch(e: unknown) {
      console.error(`[X] Failed to load ./events/${eventName}/${file}\n> Error: ${e}`);
    }
  }
}

// Client startup
client.on("clientReady", async () => {
  console.info("[READY] Client is ready");
  if (!client.user) {
    console.error("[✕] Client user is null. Did login fail?");
    return;
  }

  if (client.application) {
    await client.application.commands.set(slashCommands);
  }

  if (client.user) {
    console.info("[READY] Setting presence for " + client.user.tag + " (" + client.user.id + ")");
    client.user.setPresence({ activities: [{ name: client.users.cache.size + " magicians across " + client.guilds.cache.size + " forests!", type: ActivityType.Listening }] });
  }
  ready = true;

  setInterval(async () => {
    const validBans = await client.models.Bans.findAll({
      where: {
        expiry: {
          [Op.lte]: new Date()
        }
      }
    })
    
    const guildBans = {} as Record<string, typeof validBans>;
    for (const ban of validBans) {
      if (!guildBans[ban.guildId!]) guildBans[ban.guildId] = [];
      guildBans[ban.guildId].push(ban);
    }

    for (const [guildId, bans] of Object.entries(guildBans)) {
      const guild = await client.guilds.fetch(guildId);
      if (!guild) continue;

      for (const ban of bans) {
        try {
          await guild.members.unban(ban.userId, "Ban duration expired");
          await ban.destroy();
          console.info(`[BAN-EXP] Unbanned user ${ban.userId} from guild ${guildId} and removed ban from database`);
        } catch (e) {
          console.error(`[BAN-EXP] Failed to unban user ${ban.userId} from guild ${guildId}\n> Error: ${e}`);
        }
      }
    }
    
    if (client.user) {
      client.user.setPresence({ activities: [{ name: client.users.cache.size + " magicians across " + client.guilds.cache.size + " forests!", type: ActivityType.Listening }] });
    }
  }, 60 * 60 * 1000); // 1 hour
});

// Client event handling
client.on("interactionCreate", async (interaction) => {
  if(interaction.user.bot) return undefined as any;
  if(!interaction.inGuild()) return;
  if(interaction.isCommand() && 'options' in interaction) {
    await interaction.deferReply();

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
