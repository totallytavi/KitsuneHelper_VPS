const { Client, CommandInteraction, CommandInteractionOptionResolver } = require(`discord.js`);
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { interactionToConsole, interactionEmbed } = require(`../functions.js`);
const cooldown = new Set();

module.exports = {
  name: `editchannel`,
  data: new SlashCommandBuilder()
  .setName(`editchannel`)
  .setDescription(`Edits a channel's data`)
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
    .addStringOption(option => {
      return option
      .setName(`reason`)
      .setDescription(`Reason for editing`)
      .setRequired(false)
    })
  })
  .addSubcommand(command => {
    return command
    .setName(`topic`)
    .setDescription(`Sets a channel's topic`)
    .addChannelOption(option => {
      return option
      .setName(`channel`)
      .setDescription(`Channel to be updated (Must be a text based channel)`)
      .setRequired(true)
    })
    .addStringOption(option => {
      return option
      .setName(`topic`)
      .setDescription(`New topic`)
      .setRequired(true)
    })
    .addStringOption(option => {
      return option
      .setName(`reason`)
      .setDescription(`Reason for editing`)
      .setRequired(false)
    })
  })
  .addSubcommand(command => {
    return command
    .setName(`nsfw`)
    .setDescription(`Changes a channel's NSFW flag`)
    .addChannelOption(option => {
      return option
      .setName(`channel`)
      .setDescription(`Channel to be updated (Must be a text based channel)`)
      .setRequired(true)
    })
    .addBooleanOption(option => {
      return option
      .setName(`nsfw`)
      .setDescription(`New NSFW flag`)
      .setRequired(true)
    })
    .addStringOption(option => {
      return option
      .setName(`reason`)
      .setDescription(`Reason for the change`)
      .setRequired(false)
    })
  })
  .addSubcommand(command => {
    return command
    .setName(`slowmode`)
    .setDescription(`Changes a channel's slowmode`)
    .addChannelOption(option => {
      return option
      .setName(`channel`)
      .setDescription(`Channel to be updated (Must be a text based channel)`)
      .setRequired(true)
    })
    .addNumberOption(option => {
      return option
      .setName(`seconds`)
      .setDescription(`Slowmode in seconds`)
      .setRequired(true)
    })
    .addStringOption(option => {
      return option
      .setName(`reason`)
      .setDescription(`Reason for slowmode`)
      .setRequired(false)
    })
  })
  .addSubcommand(command => {
    return command
    .setName(`user_limit`)
    .setDescription(`Sets the user limit`)
    .addChannelOption(option => {
      return option
      .setName(`channel`)
      .setDescription(`Channel to be updated (Must be a voice based channel)`)
      .setRequired(true)
    })
    .addNumberOption(option => {
      return option
      .setName(`limit`)
      .setDescription(`New user limit (Must be 0-100)`)
      .setRequired(true)
    })
    .addStringOption(option => {
      return option
      .setName(`reason`)
      .setDescription(`Reason for the change`)
      .setRequired(false)
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
    .addStringOption(option => {
      return option
      .setName(`reason`)
      .setDescription(`Reason for changing the bitrate`)
      .setRequired(false)
    })
  })
  .addSubcommand(command => {
    return command
    .setName(`permlock`)
    .setDescription(`Set's a channel's permissions to the category's permissions (Must be a text or voice based channel)`)
    .addChannelOption(option => {
      return option
      .setName(`channel`)
      .setDescription(`Channel to be updated`)
      .setRequired(true)
    })
    .addStringOption(option => {
      return option
      .setName(`reason`)
      .setDescription(`Reason for the change`)
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
      return interactionEmbed(2, `[ERR-CLD]`, `You must have no active cooldown`, interaction, client, true)
    } else {
      const channel = options.getChannel(`channel`);
      const reason = `${options.getString(`reason`)} (Moderator ID: ${interaction.member.id})` ?? `No reason provided`;
      const option = options.getString(`name`) ?? options.getString(`topic`) ?? options.getBoolean(`nsfw`) ?? options.getNumber(`seconds`) ?? options.getString(`bitrate`) ?? options.getNumber(`limit`);
      
      // If we cannot view the channel, stop
      if(!interaction.guild.me.permissionsIn(channel).has(`VIEW_CHANNEL`)) return interactionEmbed(3, `[ERR-BPRM]`, `Missing: \`View Channel\` > ${channel}`, interaction, client, true);
      if(!interaction.member.permissionsIn(channel).has(`MANAGE_CHANNELS`)) return interactionEmbed(3, `[ERR-UPRM]`, `Missing \`Manage Channel\` > ${channel}`, interaction, client, true);
      if(!interaction.guild.me.permissionsIn(channel).has(`MANAGE_CHANNELS`)) return interactionEmbed(3, `[ERR-BPRM]`, `Missing: \`Manage Channel\` > ${channel}`, interaction, client, true);
      try {
        if(options[0].name === `name`) {
          channel.setName(option, reason)
          .then(newChannel => interactionEmbed(1, `Set ${channel}'s name was set to \`${newChannel.name}\` for \`${reason}\``, ``, interaction, client, false));
        } else if(options[0].name === `topic`) {
          if(!channel.isText()) return interactionEmbed(3, `[ERR-ARGS]`, `Arg: channel :-: Expected TextBasedChannel, got Category/VoiceBasedChannel`, interaction, client, true);
          channel.setTopic(option, reason)
          .then(newChannel => interactionEmbed(1, `Set ${channel}'s topic was set to \`${newChannel.topic}\` for \`${reason}\``, ``, interaction, client, false));
        } else if(options[0].name === `nsfw`) {
          if(!channel.isText()) return interactionEmbed(3, `[ERR-ARGS]`, `Arg: channel :-: Expected TextBasedChannel, got Category/VoiceBasedChannel`, interaction, client, true);
          channel.setNSFW(option, reason)
          .then(newChannel => interactionEmbed(1, `Set ${channel}'s NSFW flag to \`${newChannel.nsfw}\` for \`${reason}\``, ``, interaction, client, false));
        } else if(options[0].name === `seconds`) {
          if(!channel.isText()) return interactionEmbed(3, `[ERR-ARGS]`, `Arg: channel :-: Expected TextBasedChannel, got Category/VoiceBasedChannel`, interaction, client, true);
          channel.setRateLimitPerUser(option, reason)
          .then(newChannel => interactionEmbed(1, `Set ${channel}'s slowmode to \`${newChannel.rateLimitPerUser}\` for \`${reason}\``, ``, interaction, client, false));
        } else if(options[0].name === `bitrate`) {
          if(!channel.isVoice()) return interactionEmbed(3, `[ERR-ARGS]`, `Arg: channel :-: Expected VoiceBasedChannel, got TextBasedChannel`, interaction, client, true);
          channel.setBitrate(option, reason)
          .then(newChannel => interactionEmbed(1, `Set ${channel}'s bitrate to \`${newChannel.bitrate}\` for \`${reason}\``, ``, interaction, client, false));
        } else if(options[0].name === `limit`) {
          if(!channel.isVoice()) return interactionEmbed(3, `[ERR-ARGS]`, `Arg: channel :-: Expected VoiceBasedChannel, got TextBasedChannel`, interaction, client, true);
          channel.setUserLimit(option, reason)
          .then(newChannel => interactionEmbed(1, `Set ${channel}'s user limit to \`${newChannel.userLimit}\` for \`${reason}\``, ``, interaction, client, false));
        } else if(options[0].name === `permlock`) {
          channel.lockPermissions()
          .then(newChannel => interactionEmbed(1, `Set ${newChannel}'s permissions to the category's permissions`, ``, interaction, client, false));
        }
      } catch(e) {
        return interactionToConsole(String(e), `editchannel.js (Line 193)`, interaction, client);
      }

      cooldown.add(interaction.user.id);
      setTimeout(() => {
        cooldown.delete(interaction.user.id);
      }, 5000);
    }
  }
}