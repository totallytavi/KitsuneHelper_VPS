import { Client, CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";
import { interactionEmbed } from "../functions.js";
import { KitsuneClient } from "../types.js";

export const name = "settings";
export const data = new SlashCommandBuilder()
  .setName("settings")
  .setDescription("Changes your server's settings")
  .addStringOption(option => {
    return option
      .setName("option")
      .setDescription("The setting to change")
      .addChoices(
        { name: "auditLog", value: "enableAuditLogging" }
      )
      .setRequired(true);
  });
/**
 * @param {Client} client Client object
 * @param {CommandInteraction} interaction Interaction Object
 * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
 */
export async function run(client: KitsuneClient, interaction: CommandInteraction<'cached'>) {
  await interaction.editReply("My magic has worked and the result is below!");
  return interactionEmbed(4, "[INFO-DEV]", "A MySQL database has been developed and this feature is coming soon!", interaction, client, true);
}
