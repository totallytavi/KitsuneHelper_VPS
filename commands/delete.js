const { Client, Collection, CommandInteraction, CommandInteractionOptionResolver, Message, MessageButton } = require(`discord.js`);
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { interactionToConsole, interactionEmbed, promptMessage } = require(`../functions.js`);
const cooldown = new Set();
const wait = require(`util`).promisify(setTimeout);

module.exports = {
  name: `delete`,
  data: new SlashCommandBuilder()
  .setName(`delete`)
  .setDescription(`Deletes certain items from the server`)
  .addSubcommand(command => {
    return command
    .setName(`messages`)
    .setDescription(`Acts like purge, removing a set amount of messages`)
    .addNumberOption(option => {
      return option
      .setName(`amount`)
      .setDescription(`How many messages to purge (Default: 50)`)
      .setRequired(true)
    })
    .addStringOption(option => {
      return option
      .setName(`reason`)
      .setDescription(`Reason for deleting the role`)
      .setRequired(false)
    })
  })
  .addSubcommand(command => {
    return command
    .setName(`channel`)
    .setDescription(`Deletes a channel, simple as that`)
    .addChannelOption(option => {
      return option
      .setName(`channel`)
      .setDescription(`The channel to delete`)
      .setRequired(true)
    })
    .addStringOption(option => {
      return option
      .setName(`reason`)
      .setDescription(`Reason for deleting the channel`)
      .setRequired(false)
    })
  })
  .addSubcommand(command => {
    return command
    .setName(`role`)
    .setDescription(`Removes a role, no questions asked`)
    .addRoleOption(option => {
      return option
      .setName(`role`)
      .setDescription(`The role to delete`)
      .setRequired(true)
    })
    .addStringOption(option => {
      return option
      .setName(`reason`)
      .setDescription(`Reason for deleting the role`)
      .setRequired(false)
    })
  }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
   */
  run: async (client, interaction, options) => {
    if(cooldown.has(interaction.user.id)) {
      return interactionEmbed(2, `[ERR-CLD]`, `You must be have no active cooldown`, interaction, client, true)
    } else {
      const subcommand = options._subcommand;
      const reason = options.getString(`reason`) ?? `No reason specified!`;
      let option = options.getNumber(`amount`) ?? options.getChannel(`channel`) ?? options.getRole(`role`);

      // Create an Array of buttons.
      const buttons = [
        new MessageButton().setLabel(`Yes`).setCustomId(`yes`).setStyle(`SUCCESS`),
        new MessageButton().setLabel(`No`).setCustomId(`no`).setStyle(`DANGER`)
      ];
      // Get the response from them
      const button = await promptMessage(interaction, 10, buttons, `Confirm you wish to continue with deletion?`);
      // Reaction!
      if(button.customId === `yes`) {
      switch(subcommand) {
        case `messages`:
          if(!interaction.member.permissionsIn(interaction.channel).has(`MANAGE_MESSAGES`)) return interactionEmbed(3, `[ERR-UPRM]`, `Missing: \`Manage Messages\` > ${interaction.channel}`, interaction, client, true);
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`VIEW_CHANNEL`)) return interactionEmbed(3, `[ERR-BPRM]`, `Missing: \`View Channel\` > ${interaction.channel}`, interaction, client, true);
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`MANAGE_MESSAGES`)) return interactionEmbed(3, `[ERR-BPRM]`, `Missing: \`Manage Messages\` > ${interaction.channel}`, interaction, client, true);
          // Set a variable to know how many messages have been deleted
          let amount = 0;
          // Create a variable to show the original amount that should've been purged
          let original = option;
          // Create an empty variable for fetching messages
          let messages;
          try {
            // While the amount of messages is greater than 100...
            while (option > 100) {
              // Fetch the messages
              messages = await interaction.channel.messages.fetch({ limit: 100 });
              // Filter and get the new amount to purge
              option += filterMe(messages, client);
              // Delete the messages
              let deleted = await interaction.channel.bulkDelete(100, true)
              // Add the deleted amount to "amount"
              amount += deleted.size;
              // Remove 100 from the amount to purge
              option -= 100;
            }
            // While the ampunt of messages is greater than 0...
            while (option > 0) {
              // Fetch the messages
              messages = await interaction.channel.messages.fetch({ limit: option });
              // Delete the messages
              let deleted = await interaction.channel.bulkDelete(parseInt(option), true);
              // Add the deleted amount to "amount"
              amount += deleted.size;
              // Remove the amount from the amount to purge
              option -= option;
              // Filter the messages
              option += await filterMe(messages, client);
            }
            interactionEmbed(1, `Purged ${(amount === original) ? `\`${amount}\`` : `\`${amount}/${original}\``} messages!`, ``, interaction, client, false)
          } catch(e) {
            return interactionToConsole(`Failed to purge messages\n> ${e}`, `delete.js (Line 86)`, interaction, client);
          }
          break;
        case `channel`:
          if(!interaction.member.permissionsIn(interaction.channel).has(`MANAGE_CHANNELS`)) return interactionEmbed(3, `[ERR-UPRM]`, `Missing: \`Manage Channel\` > ${interaction.channel}`, interaction, client, true);
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`VIEW_CHANNEL`)) return interactionEmbed(3, `[ERR-BPRM]`, `Missing: \`View Channel\` > ${interaction.channel}`, interaction, client, true);
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`MANAGE_CHANNELS`)) return interactionEmbed(3, `[ERR-BPRM]`, `Missing: \`Manage Channel\` > ${interaction.channel}`, interaction, client, true);
          try {
            option.delete({ reason: `${reason} (Moderator ID: ${interaction.user.id})` });
            interactionEmbed(1, `Removed \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``, ``, interaction, client, false);
          } catch(e) {
            return interactionToConsole(`Failed to remove \`${option.name}\` (ID: \`${option.id}\`)\n> ${e}`, `delete.js (Line 122)`, interaction, client);
          }
          break;
        case `role`:
          if(!interaction.member.permissions.has(`MANAGE_ROLES`)) return interactionEmbed(3, `[ERR-UPRM]`, `Missing: \`Manage Roles\``, interaction, client, true);
          if(!interaction.guild.me.permissions.has(`MANAGE_ROLES`)) return interactionEmbed(3, `[ERR-BPRM]`, `Missing: \`Manage Roles\``, interaction, client, true);
          if(interaction.guild.me.roles.highest.rawPosition <= option.rawPosition) return interactionEmbed(3, `[ERR-BPRM]`, `I cannot delete roles higher or equal to me`, interaction, client, true);
          if(interaction.member.roles.highest.rawPosition <= option.rawPosition) return interactionEmbed(3, `[ERR-UPRM]`, `You cannot delete roles higher or equal to you`, interaction, client, true);
          try {
            option.delete({ reason: `${reason} (Moderator ID: ${interaction.user.id})` });
            interactionEmbed(1, `Removed \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``, ``, interaction, client, false);
          } catch(e) {
            return interactionToConsole(`Failed to remove \`${option.name}\` (ID: \`${option.id}\`)\n> ${e}`, `delete.js (Line 142)`, interaction, client);
          }
          interactionEmbed(1, `Removed \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``, ``, interaction, client);
          break;
        case `channel`:
          // If we can't remove the channel, stop.
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`VIEW_CHANNEL`)) return interactionEmbed(3, `[ERR-BPRM]`, `Missing: \`View Channel\` > ${interaction.channel}`, interaction, client, true);
          // If they can't remove the channel, stop.
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`MANAGE_CHANNELS`)) return interactionEmbed(3, `[ERR-BPRM]`, `Missing: \`View Channel\` > ${interaction.channel}`,  interaction, client, true);
          try {
            option.delete({ reason: `${reason} (Moderator ID: ${interaction.user.id})` });
            interactionEmbed(1, `Removed \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``, ``, interaction, client, false);
          } catch(e) {
            return interactionToConsole(`Failed to remove \`${option.name}\` (ID: \`${option.id}\`)\n> ${e}`, `delete.js (Line 162)`, interaction, client);
          };
          // If option.type is GUILD_CATEGORY, remove its children
          if(option.type === `category`) {
            // Create some buttons
            const buttons = [
              new MessageButton().setLabel(`Yes`).setCustomId(`yes`).setStyle(`primary`),
              new MessageButton().setLabel(`No`).setCustomId(`no`).setStyle(`danger`)
            ];
            // Create the message
            const button = await promptMessage(interaction, 10, buttons, `Are you sure you want to delete the category's children?`);
            if(button.customId === `yes`) {
              // Delete the children
              for(const child of option.children) {
                // If we lack VIEW_CHANNEL, we can't remove the channel
                if(!interaction.guild.me.permissionsIn(interaction.channel).has(`VIEW_CHANNEL`)) continue;
                if(!interaction.guild.me.permissionsIn(interaction.channel).has(`MANAGE_CHANNELS`)) continue;
                // Delete the child
                try {
                  await child.delete({ reason: `${reason} (Moderator ID: ${interaction.user.id})` });
                } catch(e) {
                  interactionToConsole(`Failed to remove child \`${child.name}\` (ID: \`${child.id}\`)\n> ${e}`, `delete.js (Line 190)`, interaction, client);
                }
              }
              interactionEmbed(1, `Removed children of \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``, ``, interaction, client, false);
            } else {
              // If they pressed the No button or didn't respond, reject it.
              interaction.editReply(`:negative_squared_cross_mark: Spell cancelled! No need to worry`)
            }
          }
          break;
      }
      } else {
        // If they pressed the No button or didn't respond, reject it.
        return interaction.editReply(`:negative_squared_cross_mark: Spell cancelled! No need to worry`)
      }

      cooldown.add(interaction.user.id);
      setTimeout(() => {
        cooldown.delete(interaction.user.id);
      }, 5000);
    }
  }
}

/**
 * Purges my messages and returns a number of how many to additionally purge
 * @param {Collection<Message>} oldMessages Collection of messages from a channel
 * @param {Client} client Client instance
 * @returns {Number} A number stating how many messages to be additionally purged
 */
async function filterMe(oldMessages, client) {
  let badMessage = oldMessages.filter(m => m.author.id === client.user.id);
  return badMessage.size;
}