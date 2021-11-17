const { Client, CommandInteraction, CommandInteractionOptionResolver, MessageSelectMenu, MessageButton } = require(`discord.js`);
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
      return interactionEmbed(2, `[ERR-CLD]`, interaction, client, true)
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
          if(!interaction.member.permissionsIn(interaction.channel).has(`MANAGE_MESSAGES`)) {
            interactionEmbed(3, `[ERR-UPRM]`, interaction, client, true);
            break;
          };
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`VIEW_CHANNEL`)) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client, true);
            break;
          }
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`MANAGE_MESSAGES`)) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client, true);
            break;
          }
          let amount = 0;
          try {
            while (option > 100) {
              interaction.channel.bulkDelete(100, true)
              .then(deleted => {amount += deleted.size; console.log(deleted.size);});
              option -= 100;
            }
            while (option > 0) {
              interaction.channel.bulkDelete(option, true)
              .then(deleted => {amount += deleted.size; console.log(deleted.size);});
              option -= option;
            }
            interactionEmbed(1, `Purged ${(amount === option) ? `\`${amount}\`` : `\`${amount}/${option}\``} messages!`, interaction, client, false)
          } catch(e) {
            interactionToConsole(`Failed to purge messages\n> ${e}`, `delete.js (Line 92)`, interaction, client);
          }
          break;
        case `channel`:
          if(!interaction.member.permissionsIn(interaction.channel).has(`MANAGE_CHANNELS`)) {
            interactionEmbed(3, `[ERR-UPRM]`, interaction, client, true);
            break;
          };
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`VIEW_CHANNEL`)) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client, true);
            break;
          }
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`MANAGE_CHANNELS`)) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client, true);
            break;
          }
          try {
            option.delete({ reason: `${reason} (Moderator ID: ${interaction.user.id})` });
            interactionEmbed(1, `Removed \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``, interaction, client, false);
          } catch(e) {
            interactionToConsole(`Failed to remove \`${option.name}\` (ID: \`${option.id}\`)\n> ${e}`, `delete.js (Line 122)`, interaction, client);
          }
          break;
        case `role`:
          if(!interaction.member.permissions.has(`MANAGE_ROLES`)) {
            interactionEmbed(3, `[ERR-UPRM]`, interaction, client, true);
            break;
          };
          if(!interaction.guild.me.permissions.has(`MANAGE_ROLES`)) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client, true);
            break;
          }
          if(interaction.guild.me.roles.highest.rawPosition <= option.rawPosition) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client, true);
            break;
          }
          try {
            option.delete({ reason: `${reason} (Moderator ID: ${interaction.user.id})` });
            interactionEmbed(1, `Removed \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``, interaction, client, false);
          } catch(e) {
            interactionToConsole(`Failed to remove \`${option.name}\` (ID: \`${option.id}\`)\n> ${e}`, `delete.js (Line 142)`, interaction, client);
          }
          interactionEmbed(1, `Removed \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``, interaction, client);
          break;
        case `channel`:
          // If we can't remove the channel, stop.
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`VIEW_CHANNEL`)) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client, true);
            break;
          }
          // If they can't remove the channel, stop.
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`MANAGE_CHANNELS`)) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client, true);
            break;
          }
          try {
            option.delete({ reason: `${reason} (Moderator ID: ${interaction.user.id})` });
            interactionEmbed(1, `Removed \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``, interaction, client, false);
          } catch(e) {
            interactionToConsole(`Failed to remove \`${option.name}\` (ID: \`${option.id}\`)\n> ${e}`, `delete.js (Line 162)`, interaction, client);
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
                  child.delete({ reason: `${reason} (Moderator ID: ${interaction.user.id})` });
                } catch(e) {
                  interactionToConsole(`Failed to remove child \`${child.name}\` (ID: \`${child.id}\`)\n> ${e}`, `delete.js (Line 190)`, interaction, client);
                }
              }
              interactionEmbed(1, `Removed children of \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``, interaction, client, false);
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