const { Client, CommandInteraction, CommandInteractionOptionResolver } = require(`discord.js`);
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { interactionToConsole, interactionEmbed } = require(`../functions.js`);
const cooldown = new Set();

module.exports = {
  name: `editchannel`,
  data: new SlashCommandBuilder()
  .setName(`editchannel`)
  .setDescription(`Edits a channel's data`)
  .addSubcommandGroup(group => {
    return group
    .setName(`text`)
    .setDescription(`Text channel options`)
    .addSubcommand(command => {
      return command
      .setName(`name`)
      .setDescription(`Sets a channel's name`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`Channel to be updated`)
        .setRequired(true)
      })
      .addStringOption(option => {
        return option
        .setName(`name`)
        .setDescription(`New name`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      return command
      .setName(`topic`)
      .setDescription(`Sets a channel's topic`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`Channel to be updated`)
        .setRequired(true)
      })
      .addStringOption(option => {
        return option
        .setName(`topic`)
        .setDescription(`New topic`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      return command
      .setName(`nsfw`)
      .setDescription(`Changes a channel's NSFW flag`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`Channel to be updated`)
        .setRequired(true)
      })
      .addBooleanOption(option => {
        return option
        .setName(`nsfw`)
        .setDescription(`New NSFW flag`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      return command
      .setName(`slowmode`)
      .setDescription(`Changes a channel's slowmode`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`Channel to be updated`)
        .setRequired(true)
      })
      .addNumberOption(option => {
        return option
        .setName(`seconds`)
        .setDescription(`Slowmode in seconds`)
        .setRequired(true)
      })
    })
  })
  .addSubcommandGroup(group => {
    return group
    .setName(`voice`)
    .setDescription(`Voice channel options`)
    .addSubcommand(command => {
      return command
      .setName(`name`)
      .setDescription(`Sets a channel's name`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`Channel to be updated`)
        .setRequired(true)
      })
      .addStringOption(option => {
        return option
        .setName(`name`)
        .setDescription(`New name`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      return command
      .setName(`user_limit`)
      .setDescription(`Sets the user limit`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`Channel to be updated`)
        .setRequired(true)
      })
      .addNumberOption(option => {
        return option
        .setName(`limit`)
        .setDescription(`New user limit`)
        .setRequired(true)
        .addChoices([
          [`no_limit`, 0],
          [`1`, 1],
          [`2`, 2],
          [`5`, 5],
          [`10`, 10],
          [`25`, 25],
          [`45`, 45],
          [`50`, 50],
          [`75`, 75],
          [`90`, 90],
          [`99`, 99]
        ])
      })
    })
    .addSubcommand(command => {
      return command
      .setName(`bitrate`)
      .setDescription(`Changes a channel's voice quality`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`Channel to be updated`)
        .setRequired(true)
      })
      .addStringOption(option => {
        return option
        .setName(`bitrate`)
        .setDescription(`New channel bitrate (64kbps is default and recommended)`)
        .setRequired(true)
        .addChoices([
          [`8kbps`, "8"],
          [`16kbps`, "16"],
          [`32kbps`, "32"],
          [`64kbps`, "64"],
          [`96kbps`, "96"],
          [`128kbps`, "128"],
          [`256kbps`, "256"],
          [`384kbps`, "384"]
        ])
      })
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
      const channel = options.getChannel(`channel`);
      const subcommand = options._subcommand
      if(options._group === `text`) {
        const option = options.getString(`name`) ?? options.getString(`topic`) ?? options.getBoolean(`nsfw`) ?? options.getNumber(`slowmode`);
        if(subcommand === `name`) {
          try {
            if(channel.type != `GUILD_TEXT`) return interactionEmbed(3, `[ERR-ARGS]`, interaction, client, true);
            if(!channel.manageable) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
            if(!interaction.member.permissionsIn(channel).has(`MANAGE_CHANNEL`)) return interactionEmbed(3, `[ERR-UPRM]`, interaction, client, true);
            if(!interaction.guild.me.permissionsIn(channel).has(`MANAGE_CHANNELS`)) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
            await channel.setName(option);
            interactionEmbed(1, `${channel}'s name was set to ${channel.name}`, interaction, client, false);
          } catch(e) {
            interactionToConsole(`Unable to edit ${channel}'s name due to an error\n> ${String(e)}`, `editchannel.js (Line 180)`, interaction, client);
          };
        } else if(subcommand === `topic`) {
          try {
            if(channel.type != `GUILD_TEXT`) return interactionEmbed(3, `[ERR-ARGS]`, interaction, client, true);
            if(!channel.manageable) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
            if(!interaction.member.permissionsIn(channel).has(`MANAGE_CHANNEL`)) return interactionEmbed(3, `[ERR-UPRM]`, interaction, client, true);
            if(!interaction.guild.me.permissionsIn(channel).has(`MANAGE_CHANNELS`)) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
            await channel.setTopic(option);
            interactionEmbed(1, `${channel}'s topic was set to ${channel.topic}`, interaction, client, false);
          } catch(e) {
            interactionToConsole(`Unable to edit ${channel}'s topic due to an error\n> ${String(e)}`, `editchannel.js (Line 187)`, interaction, client)
          };
        } else if(subcommand === `slowmode`) {
          try {
            if(channel.type != `GUILD_TEXT`) return interactionEmbed(3, `[ERR-ARGS]`, interaction, client, true);
            if(!channel.manageable) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
            if(!interaction.member.permissionsIn(channel).has(`MANAGE_CHANNEL`)) return interactionEmbed(3, `[ERR-UPRM]`, interaction, client, true);
            if(!interaction.guild.me.permissionsIn(channel).has(`MANAGE_CHANNELS`)) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
            await channel.setRateLimitPerUser(option);
            interactionEmbed(1, `${channel}'s ratelimit was set to ${channel.RateLimitPerUser} second(s)`, interaction, client, false);
          } catch(e) {
            interactionToConsole(`Unable to edit ${channel}'s ratelimit due to an error\n> ${String(e)}`, `editchannel.js (Line 194)`, interaction, client);
          };
        } else if(subcommand === `nsfw`) {
          try {
            if(channel.type != `GUILD_TEXT`) return interactionEmbed(3, `[ERR-ARGS]`, interaction, client, true);
            if(!channel.manageable) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
            if(!interaction.member.permissionsIn(channel).has(`MANAGE_CHANNEL`)) return interactionEmbed(3, `[ERR-UPRM]`, interaction, client, true);
            if(!interaction.guild.me.permissionsIn(channel).has(`MANAGE_CHANNELS`)) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
            await channel.setNSFW(option);
            interactionEmbed(1, `${channel}'s nsfw flag was set to ${channel.nsfw}`, interaction, client, false);
          } catch(e) {
            interactionToConsole(`Unable to edit ${channel}'s nsfw flag due to an error\n> ${String(e)}`, `editchannel.js (Line 201)`, interaction, client);
          };
        }
      } else if(options._group === `voice`) {
        if(channel.type != `GUILD_VOICE`) return interactionEmbed(3, `[ERR-ARGS]`, interaction, client);
        const option = options.getString(`name`) ?? options.getString(`user_limit`) ?? options.getBoolean(`bitrate`);
        if(subcommand === `name`) {
          try {
            if(channel.type != `GUILD_VOICE`) return interactionEmbed(3, `[ERR-ARGS]`, interaction, client, true);
            if(!channel.manageable) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
            if(!interaction.member.permissionsIn(channel).has(`MANAGE_CHANNEL`)) return interactionEmbed(3, `[ERR-UPRM]`, interaction, client, true);
            if(!interaction.guild.me.permissionsIn(channel).has(`MANAGE_CHANNELS`)) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
            await channel.setName(option);
            interactionEmbed(1, `${channel}'s name was set to ${channel.name}`, interaction, client, false);
          } catch(e) {
            interactionToConsole(`Unable to edit ${channel}'s name due to an error\n> ${String(e)}`, `editchannel.js (Line 208)`, interaction, client); 
          };
        } else if(subcommand === `user_limit`) {
          try {
            if(channel.type != `GUILD_VOICE`) return interactionEmbed(3, `[ERR-ARGS]`, interaction, client, true);
            if(!channel.manageable) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
            if(!interaction.member.permissionsIn(channel).has(`MANAGE_CHANNEL`)) return interactionEmbed(3, `[ERR-UPRM]`, interaction, client, true);
            if(!interaction.guild.me.permissionsIn(channel).has(`MANAGE_CHANNELS`)) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
            await channel.setUserLimit(option);
            interactionEmbed(1, `${channel}'s user limit was set to ${channel.userLimit}`, interaction, client, false);
          } catch(e) {
            interactionToConsole(`Unable to edit ${channel}'s user limit due to an error\n> ${String(e)}`, `editchannel.js (Line 215)`, interaction, client);
          };
        } else if(subcommand === `bitrate`) {
          try {
            if(channel.type != `GUILD_VOICE`) return interactionEmbed(3, `[ERR-ARGS]`, interaction, client, true);
            if(!channel.manageable) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
            if(!interaction.member.permissionsIn(channel).has(`MANAGE_CHANNEL`)) return interactionEmbed(3, `[ERR-UPRM]`, interaction, client, true);
            if(!interaction.guild.me.permissionsIn(channel).has(`MANAGE_CHANNELS`)) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
            await channel.setBitrate(option);
            interactionEmbed(1, `${channel}'s bitrate was set to ${channel.bitrate} kbps`, interaction, client, false);
          } catch(e) {
            interactionToConsole(`Unable to edit ${channel}'s bitrate due to an error\n> ${String(e)}`, `editchannel.js (Line 222)`, interaction, client);
          };
        }
      }

      cooldown.add(interaction.user.id);
      setTimeout(() => {
        cooldown.delete(interaction.user.id);
      }, 5000);
    }
  }
}