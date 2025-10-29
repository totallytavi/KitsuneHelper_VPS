import { Client, CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";
import { interactionEmbed } from "../functions.js";

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
export async function run(client, interaction) {
  await interaction.editReply("My magic has worked and the result is below!");
  return interactionEmbed(4, "[INFO-DEV]", "A MySQL database is in development and will be published in an update in the near future", interaction, client, true);
}
