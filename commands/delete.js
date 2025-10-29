import { ChannelType, Client, CommandInteraction, CommandInteractionOptionResolver, MessageButton, SlashCommandBuilder } from "discord.js";
import { awaitButtons, interactionEmbed } from "../functions.js";

export const name = "delete";
export const data = new SlashCommandBuilder()
  .setName("delete")
  .setDescription("Deletes certain items from the forest")
  .addSubcommand(command => {
    return command
      .setName("channel")
      .setDescription("Deletes a channel from the forest")
      .addChannelOption(option => {
        return option
          .setName("channel")
          .setDescription("The channel to delete")
          .setRequired(true);
      })
      .addStringOption(option => {
        return option
          .setName("reason")
          .setDescription("Reason for deleting the channel")
          .setRequired(false);
      });
  })
  .addSubcommand(command => {
    return command
      .setName("role")
      .setDescription("Removes a role from the forest")
      .addRoleOption(option => {
        return option
          .setName("role")
          .setDescription("The role to delete")
          .setRequired(true);
      })
      .addStringOption(option => {
        return option
          .setName("reason")
          .setDescription("Reason for deleting the role")
          .setRequired(false);
      });
  });
/**
 * @param {Client} client Client object
 * @param {CommandInteraction} interaction Interaction Object
 * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
 */
export async function run(client, interaction, options) {
  const subcommand = options.getSubcommand();
  const option = options.getChannel("channel") || options.getRole("role");
  const reason = options.getString("reason") ?? "No reason provided";

  const buttons = [new MessageButton({ customId: "yes", label: "Yes, I want to continue", style: "DANGER" }), new MessageButton({ customId: "no", label: "No, I don't want to continue", style: "PRIMARY" })];
  const confirmation = await awaitButtons(interaction, 15, buttons, "Are you sure you want to continue with deletion? This is irreversible!", true);
  if (confirmation.customId === "yes") {
    if (subcommand === "channel") {
      if (!interaction.member.permissionsIn(option).has("ManageChannels")) return interactionEmbed(3, "[ERR-UPRM]", `Missing: \`Manage Channels\` > ${option}`, interaction, client, true);
      if (!interaction.guild.me.permissionsIn(option).has("ManageChannels")) return interactionEmbed(3, "[ERR-BRPM]", `Missing: \`Manage Channels\` > ${option}`, interaction, client, true);

      await option.delete(`${reason} (Moderator ID: ${interaction.user.id})`);
      if (option.type === ChannelType.GuildCategory) {
        const catCheck = await awaitButtons(interaction, 15, buttons, "Do you want to delete the children channels in the category? **This is permanent!**", true);
        if (catCheck.customId === "yes") {
          for (const c of option.children.values()) {
            await c.delete(`${reason} (Moderator ID: ${interaction.user.id})`);
          }
          return interactionEmbed(1, `Successfully removed channel: ${option.name} (${option.id}) and all its children!`, "", interaction, client, true);
        }
      }
      return interactionEmbed(1, `Successfully removed channel: ${option.name} (${option.id})`, "", interaction, client, true);
    } else if (subcommand === "role") {
      if (!interaction.member.permissions.has("ManageRoles")) return interactionEmbed(3, "[ERR-UPRM]", "Missing: `Manage Roles`", interaction, client, true);
      if (!interaction.guild.me.permissions.has("ManageRoles")) return interactionEmbed(3, "[ERR-BRPM]", "Missing: `Manage Roles`", interaction, client, true);

      await option.delete(`${reason} (Moderator ID: ${interaction.user.id})`);
      return interactionEmbed(1, `Successfully removed role: ${option.name} (${option.id})`, "", interaction, client, true);
    }
  } else {
    return interaction.followUp({ content: "The spell has been cancelled! No magic was performed" });
  }
}
