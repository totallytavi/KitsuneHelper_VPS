// eslint-disable-next-line no-unused-vars
const { Client, CommandInteraction, CommandInteractionOptionResolver } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { interactionEmbed } = require("../functions.js");

module.exports = {
  name: "settings",
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Changes your server's settings")
    .addStringOption(option => {
      return option
        .setName("option")
        .setDescription("The setting to change")
        .addChoices([
          ["ban_using_ksoft", "banWithKSoft"]
        ])
        .setRequired(true);
    }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options3
   */
  run: async (client, interaction) => {
    await interaction.editReply("My magic has worked and the result is below!");
    return interactionEmbed(4, "[INFO-DEV]", "A MySQL database is in development and will be published in an update in the near future", interaction, client, true);
  }
};
