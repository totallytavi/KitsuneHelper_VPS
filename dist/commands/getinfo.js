const { SlashCommandBuilder } = require("@discordjs/builders");
// eslint-disable-next-line no-unused-vars
const { Client, CommandInteraction, CommandInteractionOptionResolver, MessageEmbed } = require("discord.js");
// Splitting into multiple files. Just too much to include here.
module.exports = {
    name: "getinfo",
    data: new SlashCommandBuilder()
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
    }),
    /**
     * @param {Client} client Client object
     * @param {CommandInteraction} interaction Interaction Object
     * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
     */
    run: async (_client, interaction, options) => {
        const subcommand = options.getSubcommand();
        const option = options.getMember("magician") || options.getRole("role") || options.getChannel("channel");
        const option2 = options.getChannel("channel");
        if (subcommand === "channel") {
            return interaction.followUp({ embeds: [new MessageEmbed({
                        title: "Channel Information",
                        description: `${option.topic}`,
                        fields: [
                            { name: "Created At", value: option.createdAt, inline: true },
                            { name: "Name", value: option.name, inline: true },
                            { name: "ID", value: option.id, inline: true },
                            { name: "Position", value: option.position, inline: true },
                            { name: "Type", value: option.type, inline: true },
                            { name: "NSFW", value: option.nsfw, inline: true },
                        ],
                        timestamp: new Date()
                    })] });
        }
        else if (subcommand === "role") {
            // Custom permissions mapper
            let permissions = option.permissions.serialize();
            permissions = [
                ["**Administrator**", permissions["ADMINISTRATOR"]],
                ["Manage Server", permissions["MANAGE_GUILD"]],
                ["Manage Channels", permissions["MANAGE_CHANNELS"]],
                ["Manage Roles", permissions["MANAGE_ROLES"]],
                ["Manage Webhooks", permissions["MANAGE_WEBHOOKS"]],
                ["Manage Emojis and Stickers", permissions["MANAGE_EMOJIS_AND_STICKERS"]],
                ["View Audit Log", permissions["VIEW_AUDIT_LOG"]],
                ["View Guild Insights", permissions["VIEW_GUILD_INSIGHTS"]],
                ["Timeout Members", permissions["MODERATE_MEMBERS"]],
                ["Kick Members", permissions["KICK_MEMBERS"]],
                ["Ban Members", permissions["BAN_MEMBERS"]],
                ["Change Nickname", permissions["CHANGE_NICKNAME"]],
                ["Manage Nicknames", permissions["MANAGE_NICKNAMES"]],
                ["View Channel", permissions["VIEW_CHANNEL"]],
                ["Create Invites", permissions["CREATE_INSTANT_INVITE"]],
                ["Send Messages", permissions["SEND_MESSAGES"]],
                ["Send TTS Messages", permissions["SEND_TTS_MESSAGES"]],
                ["Mention Everyone", permissions["MENTION_EVERYONE"]],
                ["Embed Links", permissions["EMBED_LINKS"]],
                ["Attach Files", permissions["ATTACH_FILES"]],
                ["Add Reactions", permissions["ADD_REACTIONS"]],
                ["Use External Emojis", permissions["USE_EXTERNAL_EMOJIS"]],
                ["Use External Stickers", permissions["USE_EXTERNAL_STICKERS"]],
                ["Use Application Commands", permissions["USE_APPLICATION_COMMANDS"]],
                ["Create Public Threads", permissions["CREATE_PUBLIC_THREADS"]],
                ["Create Private Threads", permissions["CREATE_PRIVATE_THREADS"]],
                ["Send Messages In Threads", permissions["SEND_MESSAGES_IN_THREADS"]],
                ["Use Public Threads", permissions["USE_PUBLIC_THREADS"]],
                ["Use Private Threads", permissions["USE_PRIVATE_THREADS"]],
                ["Manage Messages", permissions["MANAGE_MESSAGES"]],
                ["Read Message History", permissions["READ_MESSAGE_HISTORY"]],
                ["Connect", permissions["CONNECT"]],
                ["Speak", permissions["SPEAK"]],
                ["Stream", permissions["STREAM"]],
                ["Priority Speaker", permissions["PRIORITY_SPEAKER"]],
                ["Mute Members", permissions["MUTE_MEMBERS"]],
                ["Deafen Members", permissions["DEAFEN_MEMBERS"]],
                ["Use VAD", permissions["USE_VAD"]],
                ["Start Embedded Activities", permissions["START_EMBEDDED_ACTIVITIES"]],
            ].map(x => `${x[0]}: ${x[1] ? "`✅`" : "`❎`"}`);
            return interaction.followUp({ embeds: [new MessageEmbed({
                        title: "Role Information",
                        color: Math.floor(Math.random() * 16777215),
                        fields: [
                            { name: "Name", value: option.name, inline: true },
                            { name: "ID", value: option.id, inline: true },
                            { name: "Color", value: option.hexColor, inline: true },
                            { name: "Position", value: option.position, inline: true },
                            { name: "Hoisted", value: option.hoist, inline: true },
                            { name: "Permissions", value: permissions, inline: false }
                        ],
                        timestamp: new Date()
                    })] });
        }
        else if (subcommand === "permissions") {
            if (!option2) {
                // Custom permissions mapper
                let permissions = option.permissions.serialize();
                permissions = [
                    ["**Administrator**", permissions["ADMINISTRATOR"]],
                    ["Manage Server", permissions["MANAGE_GUILD"]],
                    ["Manage Channels", permissions["MANAGE_CHANNELS"]],
                    ["Manage Roles", permissions["MANAGE_ROLES"]],
                    ["Manage Webhooks", permissions["MANAGE_WEBHOOKS"]],
                    ["Manage Emojis and Stickers", permissions["MANAGE_EMOJIS_AND_STICKERS"]],
                    ["View Audit Log", permissions["VIEW_AUDIT_LOG"]],
                    ["View Guild Insights", permissions["VIEW_GUILD_INSIGHTS"]],
                    ["Timeout Members", permissions["MODERATE_MEMBERS"]],
                    ["Kick Members", permissions["KICK_MEMBERS"]],
                    ["Ban Members", permissions["BAN_MEMBERS"]],
                    ["Change Nickname", permissions["CHANGE_NICKNAME"]],
                    ["Manage Nicknames", permissions["MANAGE_NICKNAMES"]],
                    ["View Channel", permissions["VIEW_CHANNEL"]],
                    ["Create Invites", permissions["CREATE_INSTANT_INVITE"]],
                    ["Send Messages", permissions["SEND_MESSAGES"]],
                    ["Send TTS Messages", permissions["SEND_TTS_MESSAGES"]],
                    ["Mention Everyone", permissions["MENTION_EVERYONE"]],
                    ["Embed Links", permissions["EMBED_LINKS"]],
                    ["Attach Files", permissions["ATTACH_FILES"]],
                    ["Add Reactions", permissions["ADD_REACTIONS"]],
                    ["Use External Emojis", permissions["USE_EXTERNAL_EMOJIS"]],
                    ["Use External Stickers", permissions["USE_EXTERNAL_STICKERS"]],
                    ["Use Application Commands", permissions["USE_APPLICATION_COMMANDS"]],
                    ["Create Public Threads", permissions["CREATE_PUBLIC_THREADS"]],
                    ["Create Private Threads", permissions["CREATE_PRIVATE_THREADS"]],
                    ["Send Messages In Threads", permissions["SEND_MESSAGES_IN_THREADS"]],
                    ["Use Public Threads", permissions["USE_PUBLIC_THREADS"]],
                    ["Use Private Threads", permissions["USE_PRIVATE_THREADS"]],
                    ["Manage Messages", permissions["MANAGE_MESSAGES"]],
                    ["Read Message History", permissions["READ_MESSAGE_HISTORY"]],
                    ["Connect", permissions["CONNECT"]],
                    ["Speak", permissions["SPEAK"]],
                    ["Stream", permissions["STREAM"]],
                    ["Priority Speaker", permissions["PRIORITY_SPEAKER"]],
                    ["Mute Members", permissions["MUTE_MEMBERS"]],
                    ["Deafen Members", permissions["DEAFEN_MEMBERS"]],
                    ["Use VAD", permissions["USE_VAD"]],
                    ["Start Embedded Activities", permissions["START_EMBEDDED_ACTIVITIES"]],
                ].map(x => `${x[0]}: ${x[1] ? "`✅`" : "`❎`"}`);
                return interaction.followUp({ embeds: [new MessageEmbed({
                            title: "Magician Permissions",
                            color: Math.floor(Math.random() * 16777215),
                            fields: [
                                { name: "Username", value: option.user.tag, inline: true },
                                { name: "ID", value: option.user.id, inline: true },
                                { name: "Permissions", value: permissions.join("\n"), inline: false }
                            ],
                            timestamp: new Date()
                        })] });
            }
            else {
                // Custom permissions mapper
                let permissions = option.permissionsIn(option2).serialize();
                permissions = [
                    ["Manage Channels", permissions["MANAGE_CHANNELS"]],
                    ["Manage Webhooks", permissions["MANAGE_WEBHOOKS"]],
                    ["View Channel", permissions["VIEW_CHANNEL"]],
                    ["Create Invites", permissions["CREATE_INSTANT_INVITE"]],
                    ["Send Messages", permissions["SEND_MESSAGES"]],
                    ["Send TTS Messages", permissions["SEND_TTS_MESSAGES"]],
                    ["Mention Everyone", permissions["MENTION_EVERYONE"]],
                    ["Embed Links", permissions["EMBED_LINKS"]],
                    ["Attach Files", permissions["ATTACH_FILES"]],
                    ["Add Reactions", permissions["ADD_REACTIONS"]],
                    ["Use External Emojis", permissions["USE_EXTERNAL_EMOJIS"]],
                    ["Use External Stickers", permissions["USE_EXTERNAL_STICKERS"]],
                    ["Use Application Commands", permissions["USE_APPLICATION_COMMANDS"]],
                    ["Create Public Threads", permissions["CREATE_PUBLIC_THREADS"]],
                    ["Create Private Threads", permissions["CREATE_PRIVATE_THREADS"]],
                    ["Send Messages In Threads", permissions["SEND_MESSAGES_IN_THREADS"]],
                    ["Use Public Threads", permissions["USE_PUBLIC_THREADS"]],
                    ["Use Private Threads", permissions["USE_PRIVATE_THREADS"]],
                    ["Manage Messages", permissions["MANAGE_MESSAGES"]],
                    ["Read Message History", permissions["READ_MESSAGE_HISTORY"]],
                    ["Connect", permissions["CONNECT"]],
                    ["Speak", permissions["SPEAK"]],
                    ["Stream", permissions["STREAM"]],
                    ["Priority Speaker", permissions["PRIORITY_SPEAKER"]],
                    ["Mute Members", permissions["MUTE_MEMBERS"]],
                    ["Deafen Members", permissions["DEAFEN_MEMBERS"]],
                    ["Use VAD", permissions["USE_VAD"]],
                ].map(x => `${x[0]}: ${x[1] ? "`✅`" : "`❎`"}`);
                return interaction.followUp({ embeds: [new MessageEmbed({
                            title: `Magician Permissions in ${option2.name}`,
                            color: Math.floor(Math.random() * 16777215),
                            fields: [
                                { name: "Username", value: option.user.tag, inline: true },
                                { name: "ID", value: option.user.id, inline: true },
                                { name: "Permissions", value: permissions.join("\n"), inline: false }
                            ],
                            timestamp: new Date()
                        })] });
            }
        }
    }
};
