const { Client, CommandInteraction, CommandInteractionOptionResolver, MessageSelectMenu } = require(`discord.js`);
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { interactionToConsole, interactionEmbed } = require(`../functions.js`);
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
      return interactionEmbed(2, `[ERR-CLD]`, interaction, client)
    } else {
      const subcommand = options._subcommand;
      const reason = options.getString(`reason`) ?? `No reason specified!`;
      let option = options.getNumber(`amount`) ?? options.getChannel(`channel`) ?? options.getRole(`role`);

      switch(subcommand) {
        case `messages`:
          if(!interaction.member.permissionsIn(interaction.channel).has(`MANAGE_MESSAGES`)) {
            interactionEmbed(3, `[ERR-UPRM]`, interaction, client);
            break;
          };
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`VIEW_CHANNEL`)) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client);
            break;
          }
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`MANAGE_MESSAGES`)) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client);
            break;
          }
          let amount = 0;
          try {
            while (option > 100) {
              interaction.channel.bulkDelete(100, true)
              .then(deleted => amount += deleted.size);
              option = option - 100;
            }
            while (option > 0) {
              interaction.channel.bulkDelete(option, true)
              .then(deleted => amount += deleted.size);
              option = option - option;
            }
            interactionEmbed(1, `Purged ${(amount === option) ? `\`${amount}\`` : `\`${amount}/${option}\``} messages!`)
          } catch(e) {
            interactionToConsole(`Failed to purge messages\n> ${e}`, `delete.js (Line 92)`, interaction, client);
          }
          break;
        case `channel`:
          if(!interaction.member.permissionsIn(interaction.channel).has(`MANAGE_CHANNEL`)) {
            interactionEmbed(3, `[ERR-UPRM]`, interaction, client);
            break;
          };
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`VIEW_CHANNEL`)) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client);
            break;
          }
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`MANAGE_CHANNEL`)) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client);
            break;
          }
          try {
            option.delete({ reason: `${reason} (Moderator ID: ${interaction.user.id})` });
            interactionEmbed(1, `Removed \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``, interaction, client);
          } catch(e) {
            interactionToConsole(`Failed to remove \`${option.name}\` (ID: \`${option.id}\`)\n> ${e}`, `delete.js (Line 122)`, interaction, client);
          }
          break;
        case `role`:
          if(!interaction.member.permissions.has(`MANAGE_ROLES`)) {
            interactionEmbed(3, `[ERR-UPRM]`, interaction, client);
            break;
          };
          if(!interaction.guild.me.permissions.has(`MANAGE_ROLES`)) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client);
            break;
          }
          if(interaction.guild.me.roles.highest.rawPosition <= option.rawPosition) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client);
            break;
          }
          try {
            option.delete({ reason: `${reason} (Moderator ID: ${interaction.user.id})` });
            interactionEmbed(1, `Removed \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``, interaction, client);
          } catch(e) {
            interactionToConsole(`Failed to remove \`${option.name}\` (ID: \`${option.id}\`)\n> ${e}`, `delete.js (Line 142)`, interaction, client);
          }
          interactionEmbed(1, `Removed \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``, interaction, client);
          break;
        case `channel`:
          if(!interaction.member.permissions.has(`MANAGE_CHANNEL`)) {
            interactionEmbed(3, `[ERR-UPRM]`, interaction, client);
            break;
          }
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`VIEW_CHANNEL`)) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client);
            break;
          }
          if(!interaction.guild.me.permissionsIn(interaction.channel).has(`MANAGE_CHANNEL`)) {
            interactionEmbed(3, `[ERR-BPRM]`, interaction, client);
            break;
          }
          try {
            option.delete({ reason: `${reason} (Moderator ID: ${interaction.user.id})` });
            interactionEmbed(1, `Removed \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``, interaction, client);
          } catch(e) {
            interactionToConsole(`Failed to remove \`${option.name}\` (ID: \`${option.id}\`)\n> ${e}`, `delete.js (Line 162)`, interaction, client);
          };
          // If option.type is GUILD_CATEGORY, remove its children
          if(option.type === `category`) {
            await wait(2500);
            // Create a MessageSelectMenu to offer deletion of the children
            const menu = new MessageSelectMenu(interaction.channel, {
              title: `Delete all children?`,
              description: `This will delete all children of the category \`${option.name}\` (ID: \`${option.id}\`)`,
              color: `#ff0000`,
              timeout: 10000,
              cancelable: true,
              cancelButtonText: `Cancel`,
              options: [
                {
                  name: `Yes`,
                  value: `yes`,
                  emoji: `✅`
                },
                {
                  name: `No`,
                  value: `no`,
                  emoji: `❌`
                }
              ]
            });
            interaction.editReply({ components: [menu] });
            for(const child of option.children) {
              // If we lack VIEW_CHANNEL, we can't remove the channel
              if(!interaction.guild.me.permissionsIn(interaction.channel).has(`VIEW_CHANNEL`)) continue;
              if(!interaction.guild.me.permissionsIn(interaction.channel).has(`MANAGE_CHANNEL`)) continue;
              // Delete the child
              try {
                child.delete({ reason: `${reason} (Moderator ID: ${interaction.user.id})` });
              } catch(e) {
                interactionToConsole(`Failed to remove child \`${child.name}\` (ID: \`${child.id}\`)\n> ${e}`, `delete.js (Line 190)`, interaction, client);
              }
            }
            interactionEmbed(1, `Removed children of \`${option.name}\` (ID: \`${option.id}\`) for \`${reason}\``);
          }
          break;
      }

      cooldown.add(interaction.user.id);
      setTimeout(() => {
        cooldown.delete(interaction.user.id);
      }, 5000);
    }
  }
}