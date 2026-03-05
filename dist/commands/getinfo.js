import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
function serializedToBoolean(serialized, key) {
    if (key) {
        return serialized[key] ? ["`✅`"] : ["`❎`"];
    }
    return [
        ["**Administrator**", serialized["Administrator"]],
        ["Manage Server", serialized["ManageGuild"]],
        ["Manage Channels", serialized["ManageChannels"]],
        ["Manage Roles", serialized["ManageRoles"]],
        ["Manage Webhooks", serialized["ManageWebhooks"]],
        ["Manage Emojis and Stickers", serialized["ManageEmojisAndStickers"]],
        ["View Audit Log", serialized["ViewAuditLog"]],
        ["View Guild Insights", serialized["ViewGuildInsights"]],
        ["Timeout Members", serialized["ModerateMembers"]],
        ["Kick Members", serialized["KickMembers"]],
        ["Ban Members", serialized["BanMembers"]],
        ["Change Nickname", serialized["ChangeNickname"]],
        ["Manage Nicknames", serialized["ManageNicknames"]],
        ["View Channel", serialized["ViewChannel"]],
        ["Create Invites", serialized["CreateInstantInvite"]],
        ["Send Messages", serialized["SendMessages"]],
        ["Send TTS Messages", serialized["SendTTSMessages"]],
        ["Mention Everyone", serialized["MentionEveryone"]],
        ["Embed Links", serialized["EmbedLinks"]],
        ["Attach Files", serialized["AttachFiles"]],
        ["Add Reactions", serialized["AddReactions"]],
        ["Use External Emojis", serialized["UseExternalEmojis"]],
        ["Use External Stickers", serialized["UseExternalStickers"]],
        ["Use Application Commands", serialized["UseApplicationCommands"]],
        ["Create Public Threads", serialized["CreatePublicThreads"]],
        ["Create Private Threads", serialized["CreatePrivateThreads"]],
        ["Send Messages In Threads", serialized["SendMessagesInThreads"]],
        ["Create Public Threads", serialized["CreatePublicThreads"]],
        ["Create Private Threads", serialized["CreatePrivateThreads"]],
        ["Manage Messages", serialized["ManageMessages"]],
        ["Read Message History", serialized["ReadMessageHistory"]],
        ["Connect", serialized["Connect"]],
        ["Speak", serialized["Speak"]],
        ["Stream", serialized["Stream"]],
        ["Priority Speaker", serialized["PrioritySpeaker"]],
        ["Mute Members", serialized["MuteMembers"]],
        ["Deafen Members", serialized["DeafenMembers"]],
        ["Use VAD", serialized["UseVAD"]],
        ["Start Embedded Activities", serialized["UseEmbeddedActivities"]],
    ].map(x => `${x[0]}: ${x[1] ? "`✅`" : "`❎`"}`);
}
// Splitting into multiple files. Just too much to include here.
export const name = "getinfo";
export const data = new SlashCommandBuilder()
    .setName("getinfo")
    .setDescription("Retrieves information regarding a role, channel, or permissions")
    .addSubcommand(subcommand => {
    return subcommand
        .setName("channel")
        .setDescription("Gets information about a channel")
        .addChannelOption(option => {
        return option
            .setName("channel")
            .setDescription("The channel to get information about")
            .setRequired(true);
    });
})
    .addSubcommand(subcommand => {
    return subcommand
        .setName("role")
        .setDescription("Gets information about a role")
        .addRoleOption(option => {
        return option
            .setName("role")
            .setDescription("The role to get information about")
            .setRequired(true);
    });
})
    .addSubcommand(subcommand => {
    return subcommand
        .setName("permissions")
        .setDescription("Gets information about a magician's permissions")
        .addUserOption(option => {
        return option
            .setName("magician")
            .setDescription("The magician to get permissions from")
            .setRequired(true);
    })
        .addChannelOption(option => {
        return option
            .setName("channel")
            .setDescription("The channel to get permissions from (This will show magician's permissions in the channel)")
            .setRequired(false);
    });
});
/**
 * @param {Client} client Client object
 * @param {CommandInteraction} interaction Interaction Object
 * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
 */
export async function run(_client, interaction, options) {
    const subcommand = options.getSubcommand();
    // const option = options.getMember("magician") || options.getRole("role") || options.getChannel("channel");
    // const option2 = options.getChannel("channel");
    if (subcommand === "channel") {
        const option = options.getChannel("channel", true);
        const embed = new EmbedBuilder()
            .setTitle("Channel Information")
            .addFields({ name: "Created At", value: `<t:${Math.floor(option.createdAt.getTime() / 1000)}:F>`, inline: true }, { name: "Name", value: option.name, inline: true }, { name: "ID", value: option.id, inline: true }, { name: "Position", value: option.position.toString(), inline: true }, { name: "Type", value: String(option.type), inline: true })
            .setTimestamp(new Date());
        if ('topic' in option) {
            embed.setDescription(option.topic);
        }
        else {
            embed.setDescription("No topic available");
        }
        if ('nsfw' in option) {
            embed.addFields({ name: "NSFW", value: option.nsfw ? "Yes" : "No", inline: true });
        }
        return interaction.editReply({
            embeds: [embed]
        });
    }
    else if (subcommand === "role") {
        const option = options.getRole("role", true);
        // Custom permissions mapper
        const serialized = option.permissions.serialize();
        return interaction.editReply({
            embeds: [new EmbedBuilder({
                    title: "Role Information",
                    color: Math.floor(Math.random() * 16777215),
                    fields: [
                        { name: "Name", value: option.name, inline: true },
                        { name: "ID", value: option.id, inline: true },
                        { name: "Color", value: option.hexColor, inline: true },
                        { name: "Position", value: String(option.position), inline: true },
                        { name: "Hoisted", value: option.hoist ? 'Yes' : 'No', inline: true },
                        { name: "Permissions", value: serializedToBoolean(serialized).join("\n"), inline: false }
                    ],
                    timestamp: new Date()
                })]
        });
    }
    else if (subcommand === "permissions") {
        const option = options.getMember("magician");
        const option2 = options.getChannel("channel");
        if (!option2) {
            // Custom permissions mapper
            const serialized = option.permissions.serialize();
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                        title: "Magician Permissions",
                        color: Math.floor(Math.random() * 16777215),
                        fields: [
                            { name: "Username", value: option.user.tag, inline: true },
                            { name: "ID", value: option.user.id, inline: true },
                            { name: "Permissions", value: serializedToBoolean(serialized).join("\n"), inline: false }
                        ],
                        timestamp: new Date()
                    })]
            });
        }
        else {
            // Custom permissions mapper
            let permissions = option.permissionsIn(option2.id).serialize();
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                        title: `Magician Permissions in ${option2.name}`,
                        color: Math.floor(Math.random() * 16777215),
                        fields: [
                            { name: "Username", value: option.user.tag, inline: true },
                            { name: "ID", value: option.user.id, inline: true },
                            { name: "Permissions", value: serializedToBoolean(permissions).join("\n"), inline: false }
                        ],
                        timestamp: new Date()
                    })]
            });
        }
    }
}
