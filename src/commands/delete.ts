import { SlashCommandBuilder } from "@discordjs/builders";
import { BaseGuildTextChannel, BaseGuildVoiceChannel, CategoryChannel, Client, CommandInteraction, CommandInteractionOptionResolver, GuildMember, GuildMemberRoleManager, ButtonBuilder, Permissions, Role, ButtonStyle, ChannelType } from "discord.js";
import { awaitButtons, interactionEmbed } from "../functions.js";
import { KitsuneClient } from "../types.js";

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
export async function run(client: KitsuneClient, interaction: CommandInteraction<'cached'>, options: CommandInteractionOptionResolver) {
  const subcommand = options.getSubcommand();
  const reason = options.getString("reason") ?? "No reason provided";

  const buttons = [
    new ButtonBuilder()
      .setCustomId("yes")
      .setLabel("Yes, I want to continue")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("no")
      .setLabel("No, I don't want to continue")
      .setStyle(ButtonStyle.Primary)
  ];
  const confirmation = await awaitButtons(interaction, 15, buttons, "Are you sure you want to continue with deletion? This is irreversible!", true);
  if (!confirmation) return interaction.editReply({ content: "No response after 15 seconds, the spell has been cancelled! No magic was performed", components: [] });

  if (confirmation.customId === "yes") {
    if (subcommand === "channel") {
      const option = options.getChannel("channel", true) as BaseGuildTextChannel | BaseGuildVoiceChannel | CategoryChannel;
      if (!(interaction.member as GuildMember).permissionsIn(option.id).has("ManageChannels")) return interactionEmbed(3, "[ERR-UPRM]", `Missing: \`Manage Channels\` > ${option}`, interaction, client, true);
      if (!interaction.guild!.members.me!.permissionsIn(option.id).has("ManageChannels")) return interactionEmbed(3, "[ERR-BRPM]", `Missing: \`Manage Channels\` > ${option}`, interaction, client, true);

      await option.delete(`${reason} (Moderator ID: ${interaction.user.id})`);
      if (option instanceof CategoryChannel && option.children.cache.size > 0) {
        const catCheck = await awaitButtons(interaction, 15, buttons, "Do you want to delete the children channels in the category? **This is permanent!**", true);
        if (catCheck && catCheck.customId === "yes") {
          for (const c of option.children.cache.values()) {
            await c.delete(`${reason} (Moderator ID: ${interaction.user.id})`);
          }
          return interactionEmbed(1, `Successfully removed channel: ${option.name} (${option.id}) and all its children!`, "", interaction, client, true);
        } else {
          interaction.editReply({ components: [] })
        }
      }
      return interactionEmbed(1, `Successfully removed channel: ${option.name} (${option.id})`, "", interaction, client, true);
    } else if (subcommand === "role") {
      const option = options.getRole("role", true) as Role;
      if (!interaction.member!.permissions.has("ManageRoles")) return interactionEmbed(3, "[ERR-UPRM]", "Missing: `Manage Roles`", interaction, client, true);
      if (!interaction.guild!.members.me!.permissions.has("ManageRoles")) return interactionEmbed(3, "[ERR-BRPM]", "Missing: `Manage Roles`", interaction, client, true);
      if ((interaction.member!.roles as GuildMemberRoleManager).highest.comparePositionTo(option) >= 0) return interactionEmbed(3, "[ERR-UPRM]", `You cannot delete a role that is higher than your own!`, interaction, client, true);
      if (interaction.guild!.members.me!.roles.highest.comparePositionTo(option) <= 0) return interactionEmbed(3, "[ERR-BRPM]", `I cannot delete a role that is higher than my own!`, interaction, client, true);

      await option.delete(`${reason} (Moderator ID: ${interaction.user.id})`);
      return interactionEmbed(1, `Successfully removed role: ${option.name} (${option.id})`, "", interaction, client, true);
    }
  } else {
    return interaction.editReply({ content: "The spell has been cancelled! No magic was performed", components: [] });
  }
}
