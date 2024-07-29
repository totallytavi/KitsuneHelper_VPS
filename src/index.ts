'use strict';
import {
  ActivityType,
  Client,
  Collection,
  IntentsBitField,
  InteractionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord.js';
import { Sequelize, Op } from 'sequelize';
import { responseEmbed, toConsole } from './functions';
import { CustomClient } from './typings/extensions';
import { bot, mysql } from './config.json';
import * as fs from 'node:fs';
import { initModels } from './models/init-models';
const wait = require('node:util').promisify(setTimeout);
let ready = false;

//#region Setup
// Discord bot
// @ts-ignore Custom properties
const client: CustomClient = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildModeration,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildInvites
  ]
});
client.commands = new Collection();
// Database
const sequelize = new Sequelize(mysql.database, mysql.user, mysql.password, {
  dialect: 'mysql',
  logging: process.env.environment!.includes('development') ? console.log : false,
  host: mysql.host
});
client.sequelize = sequelize;
client.models = initModels(sequelize);
//#endregion

//#region Events
client.on('ready', async () => {
  toConsole(
    `[READY] Logged in as ${client.user!.tag} (${client.user!.id}) at <t:${Math.floor(Date.now() / 1000)}:T>. Client ${
      ready ? 'can' : '**cannot**'
    } receive commands!`,
    new Error(),
    client
  );
  client.guilds.cache.each((g) => g.members.fetch());
  client.user!.setActivity(`${client.users.cache.size} magicians across ${client.guilds.cache.size} forests`, {
    type: ActivityType.Listening
  });

  if (!fs.existsSync('./commands')) fs.mkdirSync('./commands');
  const slashCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  const commands = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
  for (const command of commands) {
    try {
      const file = require(`./commands/${command}`);
      slashCommands.push(file.data.toJSON());
      client.commands!.set(file.data.name, file);
    } catch (e) {
      console.error(`[CMD] Unloaded ${command}\n`, e);
    }
  }
  await client
    .application!.commands.set(slashCommands)
    .catch((e) => console.error('[APP-CMD] Failed to set slash commands\n', e));

  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: process.env.environment === 'development' });
  } catch (e) {
    console.error('[DB] Database failed validation\n', e);
    process.exit(16);
  }

  setInterval(async () => {
    await client.guilds.cache.each((g) => g.members.fetch());
    client.user!.setActivity(`${client.users.cache.size} magicians across ${client.guilds.cache.size} forests`, {
      type: ActivityType.Listening
    });

    if (ready) {
      const bans = await client.models.bans.findAll({ where: { expiry: { [Op.lte]: Date.now() } } });
      const p = [];
      // Fetch all servers' bans
      bans.forEach((b, index) => {
        // Get the guild
        const guild = client.guilds.cache.get(b.guildId);
        if (guild) {
          p.push(guild.bans.fetch());
        } else {
          bans.splice(index, 1);
        }
      });
      // Settle all Promises
      await Promise.allSettled(p);
      // Unban and set bans to inactive
      bans.forEach((b) => {
        const guild = client.guilds.cache.get(b.guildId);
        if (guild) {
          const ban = guild.bans.cache.get(b.target);
          if (ban) {
            // Unban
            p.push(guild.members.unban(b.target, `Ban expired (Moderator ID: ${client.user.id})`));
            // Set ban to inactive
            p.push(b.destroy());
          }
        }
      });
      // Settle all Promises
      await Promise.allSettled(p);
    }
  }, 60000);
});

client.on('interactionCreate', async (interaction) => {
  if (!ready) return interactionEmbed(4, '', 'The bot is starting up, please wait', interaction, client, [true, 10]);
  if (!interaction.inGuild()) return interactionEmbed(2, '[WARN-NODM]', '', interaction, client, [true, 10]);
  // Remove this line if you want to allow DM commands

  switch (interaction.type) {
    case InteractionType.ApplicationCommand: {
      let command = client.commands.get(interaction.commandName);
      if (command) {
        const ack = command.run(client, interaction, interaction.options).catch((e) => {
          interaction.editReply('Something went wrong while executing the command. Please report this to a developer');
          return toConsole(e.stack, new Error(), client);
        });

        await wait(1e4);
        if (ack != null) return; // Already executed
        interaction.fetchReply().then((m) => {
          if (m.content === '' && m.embeds.length === 0)
            interactionEmbed(
              3,
              '[ERR-UNK]',
              'The command timed out and failed to reply in 10 seconds',
              interaction,
              client,
              [true, 15]
            );
        });
      }
      break;
    }
    case InteractionType.ModalSubmit: {
      let modal = client.modals.get(interaction.customId);
      if (modal) {
        const ack = modal.run(client, interaction, interaction.fields).catch((e) => {
          interaction.editReply('Something went wrong while executing the modal. Please report this to a developer');
          return toConsole(e.stack, new Error(), client);
        });

        await wait(1e4);
        if (ack != null) return; // Already executed
        interaction.fetchReply().then((m) => {
          if (m.content === '' && m.embeds.length === 0)
            interactionEmbed(
              3,
              '[ERR-UNK]',
              'The modal timed out and failed to reply in 10 seconds',
              interaction,
              client,
              [true, 15]
            );
        });
      }
      break;
    }
  }
});
//#endregion

client.login(bot.token);

//#region Error handling
process.on('uncaughtException', (err, origin) => {
  if (!ready) {
    console.warn('Exiting due to a [uncaughtException] during start up');
    console.error(err, origin);
    return process.exit(14);
  }
  toConsole(`An [uncaughtException] has occurred.\n\n> ${err}\n> ${origin}`, new Error(), client);
});
process.on('unhandledRejection', async (promise) => {
  if (!ready) {
    console.warn('Exiting due to a [unhandledRejection] during start up');
    console.error(promise);
    return process.exit(15);
  }
  const suppressChannel = await client.channels.fetch(config.discord.suppressChannel).catch(() => {
    return undefined;
  });
  if (!suppressChannel) return console.error(`An [unhandledRejection] has occurred.\n\n> ${promise}`);
  if (
    String(promise).includes('Interaction has already been acknowledged.') ||
    String(promise).includes('Unknown interaction') ||
    String(promise).includes('Unknown Message')
  )
    return suppressChannel.send(`A suppressed error has occured at process.on(unhandledRejection):\n>>> ${promise}`);
  toConsole(`An [unhandledRejection] has occurred.\n\n> ${promise}`, new Error(), client);
});
process.on('warning', async (warning) => {
  if (!ready) {
    console.warn('[warning] has occurred during start up');
    console.warn(warning);
  }
  toConsole(`A [warning] has occurred.\n\n> ${warning}`, new Error(), client);
});
process.on('exit', (code) => {
  console.error('[EXIT] The process is exiting!');
  console.error(`[EXIT] Code: ${code}`);
});
//#endregion
