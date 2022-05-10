// eslint-disable-next-line no-unused-vars
const { Client, CommandInteraction, CommandInteractionOptionResolver } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { interactionEmbed } = require("../functions.js");

module.exports = {
  name: "editchannel",
  data: new SlashCommandBuilder()
    .setName("editchannel")
    .setDescription("Edits a channel's data")
    .addSubcommand(command => {
      return command
        .setName("name")
        .setDescription("Modifies a channel's name")
        .addChannelOption(option => {
          return option
            .setName("channel")
            .setDescription("Channel to be updated")
            .setRequired(true);
        })
        .addStringOption(option => {
          return option
            .setName("name")
            .setDescription("New name")
            .setRequired(true);
        })
        .addStringOption(option => {
          return option
            .setName("reason")
            .setDescription("Reason for editing")
            .setRequired(false);
        });
    })
    .addSubcommand(command => {
      return command
        .setName("topic")
        .setDescription("Modifies a channel's topic")
        .addChannelOption(option => {
          return option
            .setName("channel")
            .setDescription("Channel to be updated (Text based channel)")
            .setRequired(true);
        })
        .addStringOption(option => {
          return option
            .setName("topic")
            .setDescription("New topic")
            .setRequired(true);
        })
        .addStringOption(option => {
          return option
            .setName("reason")
            .setDescription("Reason for editing")
            .setRequired(false);
        });
    })
    .addSubcommand(command => {
      return command
        .setName("nsfw")
        .setDescription("Modifies a channel's NSFW flag")
        .addChannelOption(option => {
          return option
            .setName("channel")
            .setDescription("Channel to be updated (Text based channel)")
            .setRequired(true);
        })
        .addBooleanOption(option => {
          return option
            .setName("nsfw")
            .setDescription("New NSFW flag")
            .setRequired(true);
        })
        .addStringOption(option => {
          return option
            .setName("reason")
            .setDescription("Reason for the change")
            .setRequired(false);
        });
    })
    .addSubcommand(command => {
      return command
        .setName("slowmode")
        .setDescription("Modifies a channel's slowmode")
        .addChannelOption(option => {
          return option
            .setName("channel")
            .setDescription("Channel to be updated (Text based channel)")
            .setRequired(true);
        })
        .addNumberOption(option => {
          return option
            .setName("seconds")
            .setDescription("Slowmode in seconds")
            .setRequired(true);
        })
        .addStringOption(option => {
          return option
            .setName("reason")
            .setDescription("Reason for slowmode")
            .setRequired(false);
        });
    })
    .addSubcommand(command => {
      return command
        .setName("user_limit")
        .setDescription("Modifies the user limit")
        .addChannelOption(option => {
          return option
            .setName("channel")
            .setDescription("Channel to be updated (Voice based channel)")
            .setRequired(true);
        })
        .addNumberOption(option => {
          return option
            .setName("limit")
            .setDescription("New user limit (0-100)")
            .setRequired(true);
        })
        .addStringOption(option => {
          return option
            .setName("reason")
            .setDescription("Reason for the change")
            .setRequired(false);
        });
    })
    .addSubcommand(command => {
      return command
        .setName("bitrate")
        .setDescription("Modifies a channel's voice quality")
        .addChannelOption(option => {
          return option
            .setName("channel")
            .setDescription("Channel to be updated")
            .setRequired(true);
        })
        .addStringOption(option => {
          return option
            .setName("bitrate")
            .setDescription("New channel bitrate (Default: 64kbps)")
            .setRequired(true)
            .addChoices(
              { name: "8kbps", value: "8" },
              { name: "16kbps", value: "16" },
              { name: "32kbps", value: "32" },
              { name: "64kbps", value: "64" },
              { name: "96kbps", value: "96" },
              { name: "128kbps", value: "128" },
              { name: "256kbps", value: "256" },
              { name: "384kbps", value: "384" },
            );
        })
        .addStringOption(option => {
          return option
            .setName("reason")
            .setDescription("Reason for changing the bitrate")
            .setRequired(false);
        });
    })
    .addSubcommand(command => {
      return command
        .setName("permlock")
        .setDescription("Sets a channel's permissions to the category's permissions (Text/voice based channel)")
        .addChannelOption(option => {
          return option
            .setName("channel")
            .setDescription("Channel to be updated")
            .setRequired(true);
        })
        .addStringOption(option => {
          return option
            .setName("reason")
            .setDescription("Reason for the change")
            .setRequired(false);
        });
    }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
   */
  run: async (client, interaction, options) => {
    const channel = options.getChannel("channel");
    const reason = `${options.getString("reason")} (Moderator ID: ${interaction.member.id})` ?? "No reason provided";
    const option = options.getString("name") ?? options.getString("topic") ?? options.getBoolean("nsfw") ?? options.getNumber("seconds") ?? options.getString("bitrate") ?? options.getNumber("limit");
      
    // If we cannot view the channel, stop
    if(!interaction.guild.me.permissionsIn(channel).has("VIEW_CHANNEL")) return interactionEmbed(3, "[ERR-BPRM]", `Missing: \`View Channel\` > ${channel}`, interaction, client, true);
    if(!interaction.member.permissionsIn(channel).has("MANAGE_CHANNELS")) return interactionEmbed(3, "[ERR-UPRM]", `Missing \`Manage Channel\` > ${channel}`, interaction, client, true);
    if(!interaction.guild.me.permissionsIn(channel).has("MANAGE_CHANNELS")) return interactionEmbed(3, "[ERR-BPRM]", `Missing: \`Manage Channel\` > ${channel}`, interaction, client, true);
    if(options._hoistedOptions[1].name === "name") {
      channel.setName(option, reason)
        .then(newChannel => interactionEmbed(1, `Set ${channel}'s name was set to \`${newChannel.name}\` for \`${reason}\``, "", interaction, client, false));
    } else if(options._hoistedOptions[1].name === "topic") {
      if(!channel.isText()) return interactionEmbed(3, "[ERR-ARGS]", "Arg: channel :-: Expected TextBasedChannel, got Category/VoiceBasedChannel", interaction, client, true);
      channel.setTopic(option, reason)
        .then(newChannel => interactionEmbed(1, `Set ${channel}'s topic was set to \`${newChannel.topic}\` for \`${reason}\``, "", interaction, client, false));
    } else if(options._hoistedOptions[1].name === "nsfw") {
      if(!channel.isText()) return interactionEmbed(3, "[ERR-ARGS]", "Arg: channel :-: Expected TextBasedChannel, got Category/VoiceBasedChannel", interaction, client, true);
      channel.setNSFW(option, reason)
        .then(newChannel => interactionEmbed(1, `Set ${channel}'s NSFW flag to \`${newChannel.nsfw}\` for \`${reason}\``, "", interaction, client, false));
    } else if(options._hoistedOptions[1].name === "seconds") {
      if(!channel.isText()) return interactionEmbed(3, "[ERR-ARGS]", "Arg: channel :-: Expected TextBasedChannel, got Category/VoiceBasedChannel", interaction, client, true);
      channel.setRateLimitPerUser(option, reason)
        .then(newChannel => interactionEmbed(1, `Set ${channel}'s slowmode to \`${newChannel.rateLimitPerUser}\` for \`${reason}\``, "", interaction, client, false));
    } else if(options._hoistedOptions[1].name === "bitrate") {
      if(!channel.isVoice()) return interactionEmbed(3, "[ERR-ARGS]", "Arg: channel :-: Expected VoiceBasedChannel, got TextBasedChannel", interaction, client, true);
      channel.setBitrate(option, reason)
        .then(newChannel => interactionEmbed(1, `Set ${channel}'s bitrate to \`${newChannel.bitrate}\` for \`${reason}\``, "", interaction, client, false));
    } else if(options._hoistedOptions[1].name === "limit") {
      if(!channel.isVoice()) return interactionEmbed(3, "[ERR-ARGS]", "Arg: channel :-: Expected VoiceBasedChannel, got TextBasedChannel", interaction, client, true);
      channel.setUserLimit(option, reason)
        .then(newChannel => interactionEmbed(1, `Set ${channel}'s user limit to \`${newChannel.userLimit}\` for \`${reason}\``, "", interaction, client, false));
    } else if(options._hoistedOptions[1].name === "permlock") {
      channel.lockPermissions()
        .then(newChannel => interactionEmbed(1, `Set ${newChannel}'s permissions to the category's permissions`, "", interaction, client, false));
    }
  }
};