import { interactionEmbed } from "../functions.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types/v9";
import { TextBasedChannels, VoiceBasedChannels } from "../utility_types.js";
export const name = "editchannel";
export const data = new SlashCommandBuilder()
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
            .setRequired(true)
            .addChannelTypes(...TextBasedChannels);
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
            .setRequired(true)
            .addChannelTypes(...TextBasedChannels);
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
            .setRequired(true)
            .addChannelTypes(...TextBasedChannels);
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
            .setRequired(true)
            .addChannelTypes(...VoiceBasedChannels);
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
            .setRequired(true)
            .addChannelTypes(...VoiceBasedChannels);
    })
        .addStringOption(option => {
        return option
            .setName("bitrate")
            .setDescription("New channel bitrate (Default: 64kbps)")
            .setRequired(true)
            .addChoices({ name: "8kbps", value: "8" }, { name: "16kbps", value: "16" }, { name: "32kbps", value: "32" }, { name: "64kbps", value: "64" }, { name: "96kbps", value: "96" }, { name: "128kbps", value: "128" }, { name: "256kbps", value: "256" }, { name: "384kbps", value: "384" });
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
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildAnnouncement, ChannelType.GuildMedia, ChannelType.GuildStageVoice, ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.AnnouncementThread);
    })
        .addStringOption(option => {
        return option
            .setName("reason")
            .setDescription("Reason for the change")
            .setRequired(false);
    });
});
/**
 * @param {Client} client Client object
 * @param {CommandInteraction} interaction Interaction Object
 * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
 */
export async function run(client, interaction, options) {
    const channel = options.getChannel("channel", true);
    const reason = `${options.getString("reason") || "No reason provided"} (Moderator ID: ${interaction.member.id})`;
    const option = options.getString("name") ?? options.getString("topic") ?? options.getBoolean("nsfw") ?? options.getNumber("seconds") ?? options.getString("bitrate") ?? options.getNumber("limit");
    // If we cannot view the channel, stop
    if (!interaction.guild.members.me.permissionsIn(channel.id).has("ViewChannel"))
        return interactionEmbed(3, "[ERR-BPRM]", `Missing: \`View Channel\` > ${channel}`, interaction, client, true);
    if (!interaction.member.permissionsIn(channel.id).has("ManageChannels"))
        return interactionEmbed(3, "[ERR-UPRM]", `Missing \`Manage Channel\` > ${channel}`, interaction, client, true);
    if (!interaction.guild.members.me.permissionsIn(channel.id).has("ManageChannels"))
        return interactionEmbed(3, "[ERR-BPRM]", `Missing: \`Manage Channel\` > ${channel}`, interaction, client, true);
    switch (options.getSubcommand(true)) {
        case 'name': {
            channel
                .setName(option, reason)
                .then(newChannel => interactionEmbed(1, `Set ${channel}'s name was set to \`${newChannel.name}\` for \`${reason}\``, "", interaction, client, false));
            break;
        }
        case 'topic': {
            if (!channel.isTextBased() || !('setTopic' in channel))
                return interactionEmbed(3, "[ERR-ARGS]", "Arg: channel :-: Expected text based channel, got invalid channel type", interaction, client, true);
            channel
                .setTopic(option)
                .then(newChannel => interactionEmbed(1, `Set ${channel}'s topic was set to \`${newChannel.topic}\` for \`${reason}\``, "", interaction, client, false));
            break;
        }
        case 'nsfw': {
            if (!channel.isTextBased() || !('nsfw' in channel))
                return interactionEmbed(3, "[ERR-ARGS]", "Arg: channel :-: Expected text based channel, got invalid channel type", interaction, client, true);
            channel
                .setNSFW(option, reason)
                .then(() => interactionEmbed(1, `Set ${channel}'s NSFW flag to \`${option}\` for \`${reason}\``, "", interaction, client, false));
            break;
        }
        case 'slowmode': {
            if (!channel.isTextBased() || !('setRateLimitPerUser' in channel))
                return interactionEmbed(3, "[ERR-ARGS]", "Arg: channel :-: Expected text based channel, got invalid channel type", interaction, client, true);
            channel
                .setRateLimitPerUser(option, reason)
                // rateLimitPerUser isn't available on newChannel
                .then(() => interactionEmbed(1, `Set ${channel}'s slowmode to \`${option}\` for \`${reason}\``, "", interaction, client, false));
            break;
        }
        case 'bitrate': {
            if (!channel.isVoiceBased() || !('setBitrate' in channel))
                return interactionEmbed(3, "[ERR-ARGS]", "Arg: channel :-: Expected voice based channel, got invalid channel type", interaction, client, true);
            channel
                .setBitrate(parseInt(option), reason)
                // bitrate isn't available on newChannel
                .then(newChannel => interactionEmbed(1, `Set ${channel}'s bitrate to \`${newChannel.bitrate}kbps\` for \`${reason}\``, "", interaction, client, false));
            break;
        }
        case 'limit': {
            if (!channel.isVoiceBased() || !('setUserLimit' in channel))
                return interactionEmbed(3, "[ERR-ARGS]", "Arg: channel :-: Expected voice based channel, got invalid channel type", interaction, client, true);
            channel
                .setUserLimit(option, reason)
                // userLimit isn't available on newChannel
                .then(newChannel => interactionEmbed(1, `Set ${channel}'s user limit to \`${newChannel.userLimit}\` for \`${reason}\``, "", interaction, client, false));
            break;
        }
        case 'permlock': {
            if (!('lockPermissions' in channel))
                return interactionEmbed(3, "[ERR-ARGS]", "Arg: channel :-: Expected text/voice based channel, got invalid channel type", interaction, client, true);
            channel
                .lockPermissions()
                .then(() => interactionEmbed(1, `Set ${channel}'s permissions to the category's permissions for \`${reason}\``, "", interaction, client, false));
            break;
        }
        default: {
            interactionEmbed(3, "[ERR-ARGS]", "Arg: subcommand :-: Invalid subcommand", interaction, client, true);
        }
    }
}
