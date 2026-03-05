import { SlashCommandBuilder } from "@discordjs/builders";
import { Temporal } from "@js-temporal/polyfill";
import { ButtonBuilder, ButtonStyle, Client, CommandInteraction, CommandInteractionOptionResolver, GuildMemberRoleManager } from "discord.js";
import { awaitButtons, interactionEmbed, toConsole } from "../functions.js";
import { KitsuneClient } from "../types.js";

export const name = "ban";
export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Banishes a user from the forest, preventing them from returning unless unbanned")
  .addUserOption((option) => {
    return option
      .setName("user")
      .setDescription("The magician to be banished")
      .setRequired(true);
  })
  .addStringOption(option => {
    return option
      .setName("reason")
      .setDescription("The reason for banishing the magician")
      .setRequired(false);
  })
  .addNumberOption(option => {
    return option
      .setName("days")
      .setDescription("How many days before the banishment to purge messages")
      .setRequired(false)
      .addChoices(
        { name: "None", value: 0 },
        { name: "1 day", value: 1 },
        { name: "2 days", value: 2 },
        { name: "3 days", value: 3 },
        { name: "4 days", value: 4 },
        { name: "5 days", value: 5 },
        { name: "6 days", value: 6 },
        { name: "7 days", value: 7 }
      );
  })
  .addStringOption(option => {
    return option
      .setName("duration")
      .setDescription("How long to ban for (Must be Temporal compatible)")
      .setRequired(false);
  });
/**
 * @param {Client} client Client object
 * @param {CommandInteraction} interaction Interaction Object
 * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
 */
export async function run(client: KitsuneClient, interaction: CommandInteraction<'cached'>, options: CommandInteractionOptionResolver) {
  const member = options.getUser("user", true);
  const reason = options.getString("reason") ?? "No reason provided";
  const days = options.getNumber("days") ?? 0;

  let duration;
  try {
    if (options.getString("duration")) {
      const rawDuration = options.getString("duration")!
        .replaceAll(/-/g, '');
      duration = Temporal.Duration.from("P" + rawDuration);
    } else {
      duration = Temporal.Duration.from("P100Y");
    }
    duration = Date.now() + duration.total("milliseconds");
  } catch(err) {
    if (err instanceof RangeError) {
      return interactionEmbed(3, "[ERR-ARGS]", `Arg: duration :-: Invalid duration format, ${err.message}`, interaction, client, true);
    } else {
      toConsole('Failed to parse duration for ban command: ' + String(err), new Error().stack!, client);
      return interactionEmbed(3, "[ERR-ARGS]", "Arg: duration :-: An unknown error occurred while parsing the duration", interaction, client, true);
    }
  }

  if (!interaction.member) {
    return interactionEmbed(3, "[ERR-ARGS]", "Arg: member :-: Expected magician, got no magician", interaction, client, true);
  }

  if (!interaction.member.permissions.has("BanMembers")) return interactionEmbed(3, "[ERR-UPRM]", "Missing: `Ban Members`", interaction, client, true);
  if (!interaction.guild!.members.me!.permissions.has("BanMembers")) return interactionEmbed(3, "[ERR-BPRM]", "Missing: `Ban Members`", interaction, client, true);
  if (interaction.user.id === member.id) return interactionEmbed(3, "[ERR-ARGS]", "Arg: member :-: Cannot ban yourself", interaction, client, true);

  const guildMember = await interaction.guild!.members.fetch(member.id);
  if (guildMember) {
    if (guildMember.roles.highest.position >= (interaction.member.roles as GuildMemberRoleManager).highest.position) return interactionEmbed(3, "[ERR-ARGS]", "Arg: member :-: Target is higher than or equal to your highest role", interaction, client, true);
    if (guildMember.roles.highest.position >= interaction.guild!.members.me!.roles.highest.position) return interactionEmbed(3, "[ERR-ARGS]", "Arg: member :-: User is equal to or higher than the bot's highest role", interaction, client, true);
  }

  const buttons = [
    new ButtonBuilder()
      .setCustomId("yes")
      .setLabel("Yes, I do want to ban this magician")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("no")
      .setLabel("No, I do not want to ban this user")
      .setStyle(ButtonStyle.Success)
  ]
  const confirmation = await awaitButtons(interaction, 15, buttons, "Are you sure you want to ban this magician?", true);
  if (!confirmation) {
    return interactionEmbed(3, "[ERR-TIME]", "You took too long to respond, banishment cancelled", interaction, client, false);
  }

  if (confirmation.customId === "yes") {
    await interaction.guild.bans.create(member.id, { deleteMessageSeconds: (days * 24 * 60 * 60), reason: `${reason} (Moderator ID: ${interaction.user.id})` });
    await client.models.Bans.create({
      userId: member.id,
      guildId: interaction.guildId,
      modId: interaction.user.id,
      reason: reason,
      duration: String(duration)
    })
    return interactionEmbed(1, `${member} was banned for \`${reason}\`. \`${days}\` day(s) of messages sent by that user will be wiped away with magic`, "", interaction, client, false);
  } else {
    interaction.editReply({ content: ":x: Banishment cancelled, the magician remains in your forest!", components: [] });
  }
}