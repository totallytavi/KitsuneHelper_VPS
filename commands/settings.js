const { Client, CommandInteraction, CommandInteractionOptionResolver, MessageActionRow, MessageSelectMenu, MessageEmbed } = require(`discord.js`);
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { interactionToConsole, interactionEmbed } = require(`../functions.js`);
const fs = require(`fs`)
const cooldown = new Set();

module.exports = {
  name: `settings`,
  data: new SlashCommandBuilder()
  .setName(`settings`)
  .setDescription(`Changes your server's settings`)
  .addStringOption(option => {
    return option
    .setName(`option`)
    .setDescription(`The setting to change`)
    .addChoices([
      [`ban_using_ksoft`, `banWithKSoft`]
    ])
    .setRequired(true)
  }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options3
   */
  run: async (client, interaction, options) => {
    await interaction.editReply(`My magic has worked and the result is below!`)
    return interactionEmbed(4, `[INFO-DEV]`, `This command will work when SQL is implemented`, interaction, client, true);
  }
}
