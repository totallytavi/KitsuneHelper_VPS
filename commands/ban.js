import { Client, CommandInteraction, CommandInteractionOptionResolver, MessageButton, SlashCommandBuilder } from "discord.js";
import ms from "ms";
import { awaitButtons, interactionEmbed } from "../functions.js";

export const name = "ban";
export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Banishes a user from the forest, preventing them from returning unless unbanned")
  .addUserOption(option => {
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
        { name: "none", value: 0 },
        { name: "1day", value: 1 },
        { name: "2days", value: 2 },
        { name: "3days", value: 3 },
        { name: "4days", value: 4 },
        { name: "5days", value: 5 },
        { name: "6days", value: 6 },
        { name: "7days", value: 7 }
      );
  })
  .addStringOption(option => {
    return option
      .setName("duration")
      .setDescription("How long to ban the magician for (Examples: 1h, 30m, 1.5d)")
      .setRequired(false);
  });
/**
 * @param {Client} client Client object
 * @param {CommandInteraction} interaction Interaction Object
 * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
 */
export async function run(client, interaction, options) {
  const member = options.get("user");
  const reason = options.getString("reason") ?? "No reason provided";
  const days = options.getNumber("days") ?? 0;
  let duration = Date.now() + ms(options.getString("duration") ?? "NaN");
  if (duration === "NaN") {
    duration = Date.now();
    interactionEmbed(4, "Invalid time provided", "Heads up! This ban will NOT expire because you didn't supply a valid value. If you're curious about examples of proper values, please see the description of the `duration` option for this command", interaction, client, true);
  }

  if (!interaction.member.permissions.has("BanMembers")) return interactionEmbed(3, "[ERR-UPRM]", "Missing: `Ban Members`", interaction, client, true);
  if (!interaction.guild.me.permissions.has("BanMembers")) return interactionEmbed(3, "[ERR-UPRM]", "Missing: `Ban Members`", interaction, client, true);
  if (interaction.user.id === member.value) return interactionEmbed(3, "[ERR-ARGS]", "Arg: member :-: Expected other magician, got same user", interaction, client, true);
  if (member.member) {
    if (interaction.member.roles.highest.rawPosition <= member.member.roles.highest.rawPosition) return interactionEmbed(3, "[ERR-ARGS]", "Arg: member :-: Expected magician lower than executor, got magician at or above executor", interaction, client, true);
    if (interaction.guild.me.roles.highest.rawPosition <= member.member.roles.highest.rawPosition) return interactionEmbed(3, "[ERR-ARGS]", "Arg: member :-: Expected magician lower than bot, got magician at or above bot", interaction, client, true);
  }

  const confirmation = await awaitButtons(interaction, 15, [new MessageButton({ customId: "yes", label: "Yes, I do want to ban this magician", style: "DANGER" }), new MessageButton({ customId: "no", label: "No, I do not want to ban this user", style: "SUCCESS" })], "Are you sure you want to ban this magician?", true);
  if (confirmation.customId === "yes") {
    await interaction.guild.bans.create(member.value, { days: days, reason: `${reason} (Moderator ID: ${interaction.user.id})` });
    const result = await client.connection.execute("INSERT INTO Bans(banId, guildId, userId, modId, duration, reason) VALUES(?, ?, ?, ?, ?, ?)", [Buffer.from(String(Date.now())).toString("base64"), interaction.guild.id, member.value, interaction.user.id, duration + Date.now(), reason])
      .catch(e => interactionEmbed(3, "[SQL-ERR]", "[" + e.code + "] " + e.message, interaction, client, false));
    if (!result) return;
    client.event.emit("query", result[0], `${__filename.split("/")[__filename.split("/").length - 1]} 70:53`);
    return interactionEmbed(1, `${member} was banned for \`${reason}\`. \`${days}\` days of messages sent by that user will be wiped away with magic`, "", interaction, client, false);
  } else {
    interaction.editReply({ content: ":x: Banishment cancelled, the magician remains in your forest!" });
  }
}