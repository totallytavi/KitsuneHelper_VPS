import { ChannelType, Client, CommandInteraction, CommandInteractionOptionResolver, GuildChannel, GuildTextBasedChannel, ButtonBuilder, EmbedBuilder, PrivateThreadChannel, PublicThreadChannel, SlashCommandBuilder, TextChannel, VoiceChannel, ButtonStyle } from "discord.js";
import { awaitButtons, interactionEmbed } from "../functions.js";
import { KitsuneClient } from "../types.js";

export const name = "nuke";
export const data = new SlashCommandBuilder()
  .setName("nuke")
  .setDescription("Deletes and recreates a channel, clearing all messages")
  .addChannelOption(option => {
    return option
      .setName("channel")
      .setDescription("The channel to nuke")
      .setRequired(true)
      .addChannelTypes(
        ChannelType.GuildAnnouncement,
        ChannelType.GuildMedia,
        ChannelType.GuildStageVoice,
        ChannelType.GuildText,
        ChannelType.GuildVoice,
        ChannelType.AnnouncementThread
      )
  })
  .addStringOption(option => {
    return option
      .setName("reason")
      .setDescription("The reason for the nuke")
      .setRequired(false);
  });
/**
 * @param {Client} client Client object
 * @param {CommandInteraction} interaction Interaction Object
 * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
 */
export async function run(client: KitsuneClient, interaction: CommandInteraction<'cached'>, options: CommandInteractionOptionResolver) {
  const channel = options.getChannel("channel") as Exclude<GuildChannel, PublicThreadChannel|PrivateThreadChannel>;
  if (!interaction.member.permissionsIn(channel.id).has("ManageChannels")) {
    return interactionEmbed(3, "[ERR-UPRM]", `Missing: \`Manage Channel\` > ${channel}`, interaction, client, true);
  }
  if (!interaction.guild.members.me!.permissionsIn(channel.id).has("ManageChannels")) {
    return interactionEmbed(3, "[ERR-BPRM]", `Missing: \`Manage Channel\` > ${channel}`, interaction, client, true);
  }
  if (channel.parent && !interaction.guild.members.me!.permissionsIn(channel.parent.id).has("ManageChannels")) {
    return interactionEmbed(3, "[ERR-BPRM]", `Missing: \`Manage Channel\` > ${channel.parent}`, interaction, client, true);
  }

  // Now just a long list of grabbing values
  const reason = options.getString("reason") ?? "No reason provided";
  const oldName = channel.name;
  const oldParent = channel.parent;
  const oldPosition = channel.rawPosition;
  const oldPermissions = channel.permissionOverwrites.cache;
  let oldNSFW, oldRatelimit, oldTopic, oldBitrate, oldUserlimit, oldType;
  if (channel.isTextBased()) {
    oldNSFW = channel.nsfw;
    oldRatelimit = channel.rateLimitPerUser;
    // @ts-expect-error
    oldTopic = channel.topic || null;
    oldType = channel.type;
  } else if (channel.isVoiceBased()) {
    oldBitrate = channel.bitrate;
    oldUserlimit = channel.userLimit;
    oldType = channel.type;
  }

  // Create an Array of buttons.
  const buttons = [
    new ButtonBuilder().setLabel("Yes").setCustomId("yes").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setLabel("No").setCustomId("no").setStyle(ButtonStyle.Danger)
  ];
  // Get the response from them
  const button = await awaitButtons(interaction, 10, buttons, `Confirm you wish to nuke ${channel}?`, true);
  if (!button) {
    return interaction.editReply({ content: ":negative_squared_cross_mark: No response after 10 seconds, spell cancelled! No need to worry", components: [] });
  }
  // Reaction!
  if (button.customId === "yes") {
    // Now we can delete the channel
    await channel.delete(`${reason} (Moderator ID: ${interaction.user.id})`);
  } else {
    // If they pressed the No button or didn't respond, reject it.
    interaction.editReply({ content: ":negative_squared_cross_mark: Spell cancelled! No need to worry", components: [] });
    return;
  }

  // Now we can create the channel
  if (channel.isTextBased()) {
    interaction.guild.channels.create({
      name: oldName,
      type: oldType,
      nsfw: oldNSFW,
      parent: oldParent,
      permissionOverwrites: oldPermissions,
      position: oldPosition,
      topic: oldTopic
    })
      .then(channel => channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Channel Nuked")
            .setDescription(`\`${channel.name}\` (\`${channel.id}\`) was nuked by ${interaction.member} (\`${interaction.user.id}\`) for \`${reason}\``)
            .setColor("#ff0000")
            .setTimestamp()
        ]
      }));
  } else if (channel.isVoiceBased()) {
    interaction.guild.channels.create({
      name: oldName,
      type: oldType,
      parent: oldParent,
      permissionOverwrites: oldPermissions,
      position: oldPosition,
      bitrate: oldBitrate,
      userLimit: oldUserlimit
    });
  }
}