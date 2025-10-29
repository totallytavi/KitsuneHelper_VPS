import { Client, CommandInteraction, CommandInteractionOptionResolver, MessageEmbed, SlashCommandBuilder } from "discord.js";

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
  const option = options.getMember("magician") || options.getRole("role") || options.getChannel("channel");
  const option2 = options.getChannel("channel");

  if (subcommand === "channel") {
    return interaction.followUp({
      embeds: [new MessageEmbed({
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
      })]
    });
  } else if (subcommand === "role") {
    // Custom permissions mapper
    let permissions = option.permissions.serialize();
    permissions = [
      ["**Administrator**", permissions["Administrator"]],
      ["Manage Server", permissions["ManageGuild"]],
      ["Manage Channels", permissions["ManageChannels"]],
      ["Manage Roles", permissions["ManageRoles"]],
      ["Manage Webhooks", permissions["ManageWebhooks"]],
      ["Manage Emojis and Stickers", permissions["ManageEmojis"]],
      ["View Audit Log", permissions["ViewAuditLog"]],
      ["View Guild Insights", permissions["ViewGuildInsights"]],
      ["Timeout Members", permissions["ModerateMembers"]],
      ["Kick Members", permissions["KickMembers"]],
      ["Ban Members", permissions["BanMembers"]],
      ["Change Nickname", permissions["ChangeNickname"]],
      ["Manage Nicknames", permissions["ManageNicknames"]],
      ["View Channel", permissions["ViewChannel"]],
      ["Create Invites", permissions["CreateInstantInvite"]],
      ["Send Messages", permissions["SendMessages"]],
      ["Send TTS Messages", permissions["SendTTSMessages"]],
      ["Mention Everyone", permissions["MentionEveryone"]],
      ["Embed Links", permissions["EmbedLinks"]],
      ["Attach Files", permissions["AttachFiles"]],
      ["Add Reactions", permissions["AddReactions"]],
      ["Use External Emojis", permissions["UseExternalEmojis"]],
      ["Use External Stickers", permissions["UseExternalSticks"]],
      ["Use Application Commands", permissions["UseApplicationCommands"]],
      ["Create Public Threads", permissions["CreatePublicThreads"]],
      ["Create Private Threads", permissions["CreatePrivateThreads"]],
      ["Send Messages In Threads", permissions["SendMessagesInThreads"]],
      ["Use Public Threads", permissions["UsePublicThreads"]],
      ["Use Private Threads", permissions["UsePrivateThreads"]],
      ["Manage Messages", permissions["ManageMessages"]],
      ["Read Message History", permissions["ReadMessageHistory"]],
      ["Connect", permissions["Connect"]],
      ["Speak", permissions["Speak"]],
      ["Stream", permissions["Stream"]],
      ["Priority Speaker", permissions["PrioritySpeaker"]],
      ["Mute Members", permissions["MuteMembers"]],
      ["Deafen Members", permissions["DeafenMembers"]],
      ["Use VAD", permissions["UseVad"]],
      ["Start Embedded Activities", permissions["StartEmbeddedActivities"]],
    ].map(x => `${x[0]}: ${x[1] ? "`✅`" : "`❎`"}`);

    return interaction.followUp({
      embeds: [new MessageEmbed({
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
      })]
    });
  } else if (subcommand === "permissions") {
    if (!option2) {
      // Custom permissions mapper
      let permissions = option.permissions.serialize();
      permissions = [
        ["**Administrator**", permissions["Administrator"]],
        ["Manage Server", permissions["ManageGuild"]],
        ["Manage Channels", permissions["ManageChannels"]],
        ["Manage Roles", permissions["ManageRoles"]],
        ["Manage Webhooks", permissions["ManageWebhooks"]],
        ["Manage Emojis and Stickers", permissions["ManageEmojis"]],
        ["View Audit Log", permissions["ViewAuditLog"]],
        ["View Guild Insights", permissions["ViewGuildInsights"]],
        ["Timeout Members", permissions["ModerateMembers"]],
        ["Kick Members", permissions["KickMembers"]],
        ["Ban Members", permissions["BanMembers"]],
        ["Change Nickname", permissions["ChangeNickname"]],
        ["Manage Nicknames", permissions["ManageNicknames"]],
        ["View Channel", permissions["ViewChannel"]],
        ["Create Invites", permissions["CreateInstantInvite"]],
        ["Send Messages", permissions["SendMessages"]],
        ["Send TTS Messages", permissions["SendTTSMessages"]],
        ["Mention Everyone", permissions["MentionEveryone"]],
        ["Embed Links", permissions["EmbedLinks"]],
        ["Attach Files", permissions["AttachFiles"]],
        ["Add Reactions", permissions["AddReactions"]],
        ["Use External Emojis", permissions["UseExternalEmojis"]],
        ["Use External Stickers", permissions["UseExternalSticks"]],
        ["Use Application Commands", permissions["UseApplicationCommands"]],
        ["Create Public Threads", permissions["CreatePublicThreads"]],
        ["Create Private Threads", permissions["CreatePrivateThreads"]],
        ["Send Messages In Threads", permissions["SendMessagesInThreads"]],
        ["Use Public Threads", permissions["UsePublicThreads"]],
        ["Use Private Threads", permissions["UsePrivateThreads"]],
        ["Manage Messages", permissions["ManageMessages"]],
        ["Read Message History", permissions["ReadMessageHistory"]],
        ["Connect", permissions["Connect"]],
        ["Speak", permissions["Speak"]],
        ["Stream", permissions["Stream"]],
        ["Priority Speaker", permissions["PrioritySpeaker"]],
        ["Mute Members", permissions["MuteMembers"]],
        ["Deafen Members", permissions["DeafenMembers"]],
        ["Use VAD", permissions["UseVad"]],
        ["Start Embedded Activities", permissions["StartEmbeddedActivities"]],
      ].map(x => `${x[0]}: ${x[1] ? "`✅`" : "`❎`"}`);

      return interaction.followUp({
        embeds: [new MessageEmbed({
          title: "Magician Permissions",
          color: Math.floor(Math.random() * 16777215),
          fields: [
            { name: "Username", value: option.user.tag, inline: true },
            { name: "ID", value: option.user.id, inline: true },
            { name: "Permissions", value: permissions.join("\n"), inline: false }
          ],
          timestamp: new Date()
        })]
      });
    } else {
      // Custom permissions mapper
      let permissions = option.permissionsIn(option2).serialize();
      permissions = [
        ["Manage Channels", permissions["ManageChannels"]],
        ["Manage Webhooks", permissions["ManageWebhooks"]],
        ["View Channel", permissions["ViewChannel"]],
        ["Create Invites", permissions["CreateInstantInvite"]],
        ["Send Messages", permissions["SendMessages"]],
        ["Send TTS Messages", permissions["SendTTSMessages"]],
        ["Mention Everyone", permissions["MentionEveryone"]],
        ["Embed Links", permissions["EmbedLinks"]],
        ["Attach Files", permissions["AttachFiles"]],
        ["Add Reactions", permissions["AddReactions"]],
        ["Use External Emojis", permissions["UseExternalEmojis"]],
        ["Use External Stickers", permissions["UseExternalSticks"]],
        ["Use Application Commands", permissions["UseApplicationCommands"]],
        ["Create Public Threads", permissions["CreatePublicThreads"]],
        ["Create Private Threads", permissions["CreatePrivateThreads"]],
        ["Send Messages In Threads", permissions["SendMessagesInThreads"]],
        ["Use Public Threads", permissions["UsePublicThreads"]],
        ["Use Private Threads", permissions["UsePrivateThreads"]],
        ["Manage Messages", permissions["ManageMessages"]],
        ["Read Message History", permissions["ReadMessageHistory"]],
        ["Connect", permissions["Connect"]],
        ["Speak", permissions["Speak"]],
        ["Stream", permissions["Stream"]],
        ["Priority Speaker", permissions["PrioritySpeaker"]],
        ["Mute Members", permissions["MuteMembers"]],
        ["Deafen Members", permissions["DeafenMembers"]],
        ["Use VAD", permissions["UseVad"]],
      ].map(x => `${x[0]}: ${x[1] ? "`✅`" : "`❎`"}`);

      return interaction.followUp({
        embeds: [new MessageEmbed({
          title: `Magician Permissions in ${option2.name}`,
          color: Math.floor(Math.random() * 16777215),
          fields: [
            { name: "Username", value: option.user.tag, inline: true },
            { name: "ID", value: option.user.id, inline: true },
            { name: "Permissions", value: permissions.join("\n"), inline: false }
          ],
          timestamp: new Date()
        })]
      });
    }
  }
}