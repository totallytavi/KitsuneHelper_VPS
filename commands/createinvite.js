const { Client, CommandInteraction, CommandInteractionOptionResolver } = require(`discord.js`);
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { interactionToConsole, interactionEmbed } = require(`../functions.js`);
const cooldown = new Set();

module.exports = {
  name: `createinvite`,
  data: new SlashCommandBuilder()
  .setName(`createinvite`)
  .setDescription(`Creates an invite for a certain channel`)
  .addChannelOption((option) => {
    return option
    .setName(`channel`)
    .setDescription(`The channel to create the invite for (Default: This channel)`)
    .setRequired(false)
  })
  .addIntegerOption((option) => {
    return option
    .setName(`age`)
    .setDescription(`How many days should the invite last (Default: Unlimited)`)
    .setRequired(false)
    .addChoices([
      ["1hour", 3600],
      ["1day", 86400],
      ["1week", 604800],
      ["forever", 0]
    ])
  })
  .addIntegerOption((option) => {
    return option
    .setName(`max_uses`)
    .setDescription(`The amount of people that can use this invite (Default: Unlimited)`)
    .setRequired(false)
  })
  .addBooleanOption((option) => {
    return option
    .setName(`temporary_membership`)
    .setDescription(`Should the user be kicked after 24 hours and they have no roles? (Default: false)`)
    .setRequired(false)
  }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
   */
  run: async (client, interaction, options) => {
    if(cooldown.has(interaction.member.id)) {
      return interactionEmbed(2, `[ERR-CLD]`, interaction, client, true)
    } else {
      const channel = options.getChannel(`channel`) ?? interaction.channel
      const age = options.getInteger(`age`);
      const max_uses = options.getInteger(`max_uses`);
      const temporary_membership = options.getBoolean(`temporary_membership`);

      try {
        if(!interaction.member.permissionsIn(channel).has(`CREATE_INSTANT_INVITE`)) return interactionEmbed(3, `[ERR-UPRM]`, interaction, client, true);
        if(!interaction.guild.me.permissionsIn(channel).has("CREATE_INSTANT_INVITE")) return interactionEmbed(3, `[ERR-BPRM]`, `createinvite.js (Line 59)`, interaction, client, true);

        channel.createInvite({ age: age, max_uses: max_uses, temporary: temporary_membership })
        .then(invite => interactionEmbed(1, `Here is the invite:\n${invite}`, interaction, client, false));
      } catch(e) {
        interactionToConsole(`Failed to create an invite for a server\n> ${String(e)}`, `createinvite.js (Line 56)`, interaction, client);
      }

      cooldown.add(interaction.user.id);
      setTimeout(() => {
        cooldown.delete(interaction.user.id);
      }, 5000);
    }
  }
}