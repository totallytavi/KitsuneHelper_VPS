const { Client, CommandInteraction, CommandInteractionOptionResolver } = require(`discord.js`);
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { interactionToConsole, interactionEmbed } = require(`../functions.js`);
const cooldown = new Set();

module.exports = {
  name: `ban`,
  data: new SlashCommandBuilder()
  .setName(`ban`)
  .setDescription(`Permanently a user from the server. They cannot rejoin unless unbanned`)
  .addUserOption(option => {
    return option
    .setName(`user`)
    .setDescription(`The user to ban from the server`)
    .setRequired(true)
  })
  .addStringOption(option => {
    return option
    .setName(`reason`)
    .setDescription(`The reason for banning the user`)
    .setRequired(false)
  })
  .addNumberOption(option => {
    return option
    .setName(`days`)
    .setDescription(`How many days before the ban to purge messages`)
    .setRequired(false)
    .addChoices([
      [`none`, 0],
      [`1day`, 1],
      [`2days`, 2],
      [`3days`, 3],
      [`4days`, 4],
      [`5days`, 5],
      [`6days`, 6],
      [`7days`, 7]
    ])
  }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
   */
  run: async (client, interaction, options) => {
    if(cooldown.has(interaction.user.id)) {
      return interactionEmbed(2, `[ERR-CLD]`, interaction, client, true)
    } else {
      const member = options.getMember(`user`);
      const reason = options.getString(`reason`) ?? `No reason provided`;
      const days = options.getNumber(`days`) ?? 0;

      if(!interaction.member.permissions.has(`BAN_MEMBERS`)) return interactionEmbed(3, `[ERR-UPRM]`, interaction, client, true);
      if(!interaction.guild.me.permissions.has(`BAN_MEMBERS`)) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, true);
      if(!member.manageable) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, true);

      try {
        await member.ban({ reason: reason, days: days });
        interactionEmbed(1, `${member} (${member.id}) was banned for: ${reason}. ${days} day(s) worth of messages were purged`);
      } catch(e) {
        interactionToConsole(`Failed to kick \`${member.id}\` from \`${interaction.guild.id}\``, `kick.js (Line 40)`, interaction, client);
      }

      cooldown.add(interaction.user.id);
      setTimeout(() => {
        cooldown.delete(interaction.user.id);
      }, 5000);
    }
  }
}