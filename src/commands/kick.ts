import { Client, CommandInteraction, CommandInteractionOptionResolver, GuildMember, ButtonBuilder, SlashCommandBuilder, ButtonStyle } from "discord.js";
import { awaitButtons, interactionEmbed } from "../functions.js";
import { KitsuneClient } from "../types.js";

export const name = "kick";
export const data = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Boots a user from the forest")
  .addUserOption(option => {
    return option
      .setName("user")
      .setDescription("The magician to be removed")
      .setRequired(true);
  })
  .addStringOption(option => {
    return option
      .setName("reason")
      .setDescription("The reason for removing the magician")
      .setRequired(false);
  });
/**
 * @param {Client} client Client object
 * @param {CommandInteraction} interaction Interaction Object
 * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
 */
export async function run(client: KitsuneClient, interaction: CommandInteraction<'cached'>, options: CommandInteractionOptionResolver) {
  const member = options.getMember("user") as GuildMember;
  const reason = options.getString("reason") ?? "No reason provided";

  if (!interaction.member.permissions.has("KickMembers")) return interactionEmbed(3, "[ERR-UPRM]", "Missing: `Kick Members`", interaction, client, true);
  if (!interaction.guild.members.me!.permissions.has("KickMembers")) return interactionEmbed(3, "[ERR-UPRM]", "Missing: `Kick Members`", interaction, client, true);
  if (interaction.user.id === member.user.id) return interactionEmbed(3, "[ERR-ARGS]", "Arg: member :-: Expected other user, got same user", interaction, client, true);
  if (interaction.member.roles.highest.rawPosition <= member.roles.highest.rawPosition) return interactionEmbed(3, "[ERR-ARGS]", "Arg: member :-: Expected user lower than executor, got user at or above executor", interaction, client, true);
  if (interaction.guild.members.me!.roles.highest.comparePositionTo(member.roles.highest) <= 0) return interactionEmbed(3, "[ERR-ARGS]", "Arg: member :-: Expected user lower than bot, got user at or above bot", interaction, client, true);

  const confirmation = await awaitButtons(interaction, 15, [new ButtonBuilder({ customId: "yes", label: "Yes, I want to kick the magician", style: ButtonStyle.Danger }), new ButtonBuilder({ customId: "no", label: "No, I do not want to kick the magician", style: ButtonStyle.Success })], "Are you sure you want to kick this magician?", true);
  if (!confirmation) return interaction.editReply({ content: ":x: No response after 15 seconds, banishment cancelled, the magician remains in your forest!", components: [] });

  if (confirmation.customId === "yes") {
    await member.kick(`${reason} (Moderator ID: ${interaction.user.id})`);
    await client.models.Kicks.create({
      userId: member.user.id,
      modId: interaction.user.id,
      guildId: interaction.guild.id,
      reason,
    });
    return interactionEmbed(1, `${member} was kicked for \`${reason}\`.`, "", interaction, client, false);
  } else {
    interaction.editReply({ content: ":x: Banishment cancelled, the magician remains in your forest!", components: [] });
  }
}