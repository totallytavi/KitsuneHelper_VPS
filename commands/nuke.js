// eslint-disable-next-line no-unused-vars
import { Client, CommandInteraction, CommandInteractionOptionResolver, MessageEmbed, MessageButton } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { interactionEmbed, awaitButtons } from "../functions.js";

export const name = "nuke";
export const data = new SlashCommandBuilder()
  .setName("nuke")
  .setDescription("Deletes and recreates a channel, clearing all messages")
  .addChannelOption(option => {
    return option
      .setName("channel")
      .setDescription("The channel to nuke")
      .setRequired(true);
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
export async function run(client, interaction, options) {
  const channel = options.getChannel("channel");
  if (!interaction.member.permissionsIn(channel).has("MANAGE_CHANNEL")) {
    return interactionEmbed(3, "[ERR-UPRM]", `Missing: \`Manage Channel\` > ${channel}`, interaction, client, true);
  }
  if (!interaction.guild.me.permissionsIn(channel).has("MANAGE_CHANNEL")) {
    return interactionEmbed(3, "[ERR-BPRM]", `Missing: \`Manage Channel\` > ${channel}`, interaction, client, true);
  }
  if (channel.parent && !interaction.guild.me.permissionsIn(channel.parent).has("MANAGE_CHANNEL")) {
    return interactionEmbed(3, "[ERR-BPRM]", `Missing: \`Manage Channel\` > ${channel.parent}`, interaction, client, true);
  }

  // Now just a long list of grabbing values
  const reason = options.getString("reason") ?? "No reason provided";
  const oldName = channel.name;
  const oldParent = channel.parent;
  const oldPosition = channel.rawPosition;
  const oldPermissions = channel.permissionOverwrites.cache;
  let oldNSFW, oldRatelimit, oldTopic, oldBitrate, oldUserlimit, oldType;
  switch (channel.type) {
    case "GUILD_TEXT":
      oldNSFW = channel.nsfw;
      oldRatelimit = channel.rateLimitPerUser;
      oldTopic = channel.topic;
      oldType = channel.oldType;
      break;
    case "GUILD_VOICE":
      oldBitrate = channel.bitrate;
      oldUserlimit = channel.userLimit;
      oldType = channel.oldType;
      break;
    default:
      oldNSFW = channel.nsfw;
      oldRatelimit = channel.rateLimitPerUser;
      oldTopic = channel.topic;
      oldType = channel.oldType;
      break;
  }

  // Create an Array of buttons.
  const buttons = [
    new MessageButton().setLabel("Yes").setCustomId("yes").setStyle("SUCCESS"),
    new MessageButton().setLabel("No").setCustomId("no").setStyle("DANGER")
  ];
  // Get the response from them
  const button = await awaitButtons(interaction, 10, buttons, `Confirm you wish to nuke ${channel}?`, true);
  // Reaction!
  if (button.customId === "yes") {
    // Now we can delete the channel
    await channel.delete(`${reason} (Moderator ID: ${interaction.user.id})`);
  } else {
    // If they pressed the No button or didn't respond, reject it.
    interaction.editReply(":negative_squared_cross_mark: Spell cancelled! No need to worry");
  }

  // Now we can create the channel
  switch (oldType) {
    case "GUILD_TEXT":
      interaction.guild.channels.create(oldName, {
        type: oldType,
        nsfw: oldNSFW,
        parent: oldParent,
        permissionOverwrites: oldPermissions,
        position: oldPosition,
        rateLimitPerUser: oldRatelimit,
        topic: oldTopic,
      })
        .then(channel => channel.send({
          embeds: [
            new MessageEmbed()
              .setTitle("Channel Nuked")
              .setDescription(`\`${channel.name}\` (\`${channel.id}\`) was nuked by ${interaction.member} (\`${interaction.user.id}\`) for \`${reason}\``)
              .setColor("#ff0000")
              .setTimestamp()
          ]
        }));
      break;
    case "GUILD_VOICE":
      interaction.guild.channels.create(oldName, {
        type: oldType,
        parent: oldParent,
        permissionOverwrites: oldPermissions,
        position: oldPosition,
        bitrate: oldBitrate,
        userLimit: oldUserlimit
      });
      break;
    default:
      interaction.guild.channels.create(oldName, {
        type: oldType,
        nsfw: oldNSFW,
        parent: oldParent,
        permissionOverwrites: oldPermissions,
        position: oldPosition,
        rateLimitPerUser: oldRatelimit,
        topic: oldTopic,
      })
        .then(channel => channel.send({
          embeds: [
            new MessageEmbed()
              .setTitle("Channel Nuked")
              .setDescription(`\`${channel.name}\` (\`${channel.id}\`) was nuked by ${interaction.member} (\`${interaction.user.id}\`) for \`${reason}\``)
              .setColor("#ff0000")
              .setTimestamp()
          ]
        }));
      break;
  }
}