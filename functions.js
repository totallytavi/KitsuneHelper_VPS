import { ComponentType } from "discord-api-types/v10";
import { Client, CommandInteraction, Interaction, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, MessageSelectOptionData, SelectMenuInteraction } from "discord.js";
import { bot } from "./config.json" assert {"type": "json"};

const errors = {
  "[SQL-ERR]": "An error has occurred while trying to execute a MySQL query",
  "[ERR-CLD]": "You are on cooldown!",
  "[ERR-UPRM]": "You do not have the proper permissions to execute this command",
  "[ERR-BPRM]": "I do not have the proper permissions to execute this command",
  "[ERR-ARGS]": "You have not supplied the correct parameters. Please check again",
  "[ERR-UNK]": "I can't tell why an issue spawned. Please report this to a developer",
  "[ERR-EXPT]": "An unexpected error occurred",
  "[ERR-MISS]": "I cannot find the information in the system",
  "[WARN-NODM]": "Sorry, but all slash commands only work in a server, not DMs",
  "[WARN-CMD]": "The requested slash command was not found",
  "[INFO-DEV]": "This command is in development. This should not be expected to work"
};
/**
 * @description Sends a message to the console
 * @param {string} message [REQUIRED] The message to send to the console
 * @param {string} source [REQUIRED] Source of the message
 * @param {Client} client [REQUIRED] A logged-in Client to send the message
 * @returns {null} null
 * @example toConsole(`Hello, World!`, `functions.js 12:15`, client);
 * @example toConsole(`Published a ban`, `ban.js 14:35`, client);
 */
export async function toConsole(message, source, client) {
  if (!message) return new SyntaxError("message is undefined");
  if (!source) return new SyntaxError("source is undefined");
  if (!client) return new SyntaxError("client is undefined");
  if (!client.channels.cache.get(bot["errorChannel"])) return console.warn("[WARN] Error channel note found but data was sent to the console\n\n" + message + "\n> Source: " + source);

  client.channels.cache.get(bot["errorChannel"]).send(`Incoming message from ${source}`);

  client.channels.cache.get(bot["errorChannel"]).send({
    embeds: [
      new MessageEmbed({
        title: "Message to Console",
        color: "RED",
        description: `${message}`,
        footer: {
          text: `Source: ${source}`
        },
        timestamp: new Date()
      })
    ]
  });

  return null;
}
/**
 * @description Replies with a MessageEmbed to the Interaction
 * @param {number} type 1- Sucessful, 2- Warning, 3- Error, 4- Information
 * @param {string} content The information to state
 * @param {string} expected The expected argument (If applicable)
 * @param {Interaction} interaction The Interaction object for responding
 * @param {Client} client Client object for logging
 * @param {boolean} ephemeral Whether or not to ephemeral the message
 * @example interactionEmbed(1, `Removed ${removed} roles`, ``, interaction, client, false)
 * @example interactionEmbed(3, "[ERR-UPRM]"", "Missing: `Manage Messages`", interaction, client, true)
 * @returns {null} 
 */
export async function interactionEmbed(type, content, expected, interaction, client, ephemeral) {
  if (!type || !content || !interaction || !client || ephemeral === undefined) return new SyntaxError(`One or more arguments for interactionEmbed have received an invalid value\n> type: ${type}\n> content: ${content}\n> interaction: ${interaction}\n> client: ${client}\n> ephemeral: ${ephemeral}`);
  const embed = new MessageEmbed();

  switch (type) {
    case 1:
      embed
        .setTitle("Success")
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true, size: 4096 }) })
        .setColor("BLURPLE")
        .setDescription(!errors[content] ? content : `${errors[content]}\n> ${expected}`)
        .setFooter({ text: "The operation was completed successfully with no errors" })
        .setTimestamp();

      // eslint-disable-next-line no-useless-escape
      await interaction.editReply({ content: "\:unlock: [CMD-OK]" });
      await interaction.followUp({ embeds: [embed], ephemeral: ephemeral });

      break;
    case 2:
      embed
        .setTitle("Warning")
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true, size: 4096 }) })
        .setColor("ORANGE")
        .setDescription(!errors[content] ? content : `${errors[content]}\n> ${expected}`)
        .setFooter({ text: "The operation was completed successfully with a minor error" })
        .setTimestamp();

      // eslint-disable-next-line no-useless-escape
      await interaction.editReply({ content: "\:closed_lock_with_key: [CMD-WARN]" });
      await interaction.followUp({ embeds: [embed], ephemeral: ephemeral });

      break;
    case 3:
      embed
        .setTitle("Error")
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true, size: 4096 }) })
        .setColor("RED")
        .setDescription(!errors[content] ? `I don't understand the error "${content}" but was expecting ${expected}. Please report this to the support server!` : `${errors[content]}\n> ${expected}`)
        .setFooter({ text: "The operation failed to complete due to an error" })
        .setTimestamp();

      // eslint-disable-next-line no-useless-escape
      await interaction.editReply({ content: "\:lock: [CMD-ERROR]" });
      await interaction.followUp({ embeds: [embed], ephemeral: ephemeral });

      break;
    case 4:
      embed
        .setTitle("Information")
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true, size: 4096 }) })
        .setColor("BLURPLE")
        .setDescription(!errors[content] ? content : `${errors[content]}\n> ${expected}`)
        .setFooter({ text: "The operation is pending completion" })
        .setTimestamp();

      // eslint-disable-next-line no-useless-escape
      await interaction.editReply({ content: "\:lock_with_ink_pen: [CMD-INFO]" });
      await interaction.followUp({ embeds: [embed], ephemeral: ephemeral });

      break;
  }
}
/**
 * Sends buttons to a user and awaits the response
 * @param {CommandInteraction} interaction Interaction object
 * @param {number} time Seconds for which the buttons are valid
 * @param {Array<MessageButton>} buttons The buttons to place on the message
 * @param {String|null} content The content to display, can be blank
 * @param {boolean} remove Delete the message after the time expires
 * @example awaitButtons(interaction, 15, [button1, button2], `Select a button`, true);
 * @returns {MessageButton|null} The button the user clicked or null if no button was clicked
 */
export async function awaitButtons(interaction, time, buttons, content, remove) {
  if (!interaction || !time || !buttons || remove === null) return new SyntaxError(`One of the following values is not fulfilled:\n> interaction: ${interaction}\n> time: ${time}\n> buttons: ${buttons}\n> remove: ${remove}`);
  content = content ?? "Please select an option";

  // Create a filter
  const filter = i => {
    i.deleteReply();
    return i.user.id === interaction.user.id;
  };
  // Convert the time to milliseconds
  time *= 1000;
  // Create a MessageActionRow and add the buttons
  const row = new MessageActionRow();
  row.addComponents(buttons);
  // Send a follow-up message with the buttons and await a response
  const message = await interaction.followUp({ content: content, components: [row] });
  const res = await message
    .awaitMessageComponent({ filter, componentType: "BUTTON", time: time, errors: ["time"] })
    .catch(() => { return null; });
  // Disable the buttons on row
  for (const button of row.components) {
    button.setDisabled(true);
  }
  // Send the disabled row
  // eslint-disable-next-line no-useless-escape
  await message.edit({ content: res === null ? "\:lock: Cancelled" : content, components: [row] });
  setTimeout(() => {
    // Clear buttons
    if (remove && res != null) message.edit({ content: interaction.fetchReply().content, components: [] });
  }, 5000);
  // Return the button (Or null if no response was given)
  return res;
}
/**
 * Send a MessageSelectMenu to a user and awaits the response
 * @param {Interaction} interaction Interaction object
 * @param {number} time Seconds for which the menu is valid
 * @param {number[]} values [min, max] The amount of values that can be selected
 * @param {MessageSelectOptionData|MessageSelectOptionData[]} options The options for the menu
 * @param {String|null} content The content to display, can be blank
 * @param {boolean} remove Delete the message after the time expires
 * @example awaitMenu(interaction, 15, [menu], `Select an option`, true);
 * @returns {SelectMenuInteraction|null} The menu the user interacted with or null if nothing was selected
 */
export async function awaitMenu(interaction, time, values, options, content, remove) {
  // Step 0: Checks
  if (!interaction || !time || !values || !options || remove === null) return new SyntaxError(`One of the following values is not fulfilled:\n> interaction: ${interaction}\n> time: ${time}\n> values: ${values}\n> options: ${options}\n> remove: ${remove}`);
  content = content ?? "Please select an option";

  // Step 1: Setup
  const filter = i => {
    i.deferUpdate();
    return i.user.id === interaction.user.id;
  };
  time *= 1000;

  // Step 2: Creation
  const row = new MessageActionRow();
  const menu = new MessageSelectMenu({
    minValues: values[0],
    maxValues: values[1],
    customId: "await-menu"
  });
  menu.addOptions(options);
  row.addComponents(menu);

  // Step 3: Execution
  const message = await interaction.followUp({ content: content, components: [row] });
  const res = await message
    .awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: time, errors: ["time"] })
    .catch(() => { return null; });

  // Step 4: Processing
  row.components[0].setDisabled(true);
  // eslint-disable-next-line no-useless-escape
  await message.edit({ content: res === null ? "\:lock: Cancelled" : content, components: [row] });

  // Step 5: Cleanup
  setTimeout(() => {
    if (!message.deleted && remove && res != null) message.delete();
  }, 1500);
  return res;
}