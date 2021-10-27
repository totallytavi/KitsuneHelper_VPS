const { Client, CommandInteraction, CommandInteractionOptionResolver } = require(`discord.js`);
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { interactionEmbed, interactionToConsole } = require(`../functions.js`);
const cooldown = new Set();

module.exports = {
  name: `nickname`,
  data: new SlashCommandBuilder()
  .setName(`nickname`)
  .setDescription(`Changes yours, the bot's, or another user's nickname`)
  .addMentionableOption(option => {
    return option
    .setName(`user`)
    .setDescription(`The user whose nickname you want to change`)
    .setRequired(true)
  })
  .addStringOption(option => {
    return option
    .setName(`new_nickname`)
    .setDescription(`The nickname to apply (Maximum length of 32 characters)`)
    .setRequired(true)
  })
  .addStringOption(option => {
    return option
    .setName(`reason`)
    .setDescription(`The reason you are changing their nickname`)
    .setRequired(false)
  }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
   */
  run: async (client, interaction, options) => {
    if(cooldown.has(interaction.user.id)) {
      return interactionEmbed(2, `[ERR-CLD]`, interaction, client);
    } else {
      const member = options.getMentionable(`user`);
      const nickname = options.getString(`new_nickname`);
      const reason = options.getString(`reason`) ?? `No reason provided`;

      try {
        if(member === interaction.guild.me) {
          if(!interaction.guild.me.permissions.has(`CHANGE_NICKNAME`)) return interactionEmbed(2, `[ERR-BPRM]`, interaction, client, false);
        } else if(member === interaction.member) {
          if(!interaction.member.permissions.has(`CHANGE_NICKNAME`)) return interactionEmbed(3, `[ERR-UPRM]`, interaction, client);
        } else {
          if(!interaction.guild.me.permissions.has(`MANAGE_NICKNAMES`)) return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, false);
        }
        if(nickname.length > 32) {
          return interactionEmbed(3, `[ERR-ARGS]`, interaction, client);
        }

        await member.setNickname(nickname, `${reason} (Moderator ID: ${interaction.member.id})`);
        interactionEmbed(1, `Updated ${member}'s (${member.id}) nickname to \`${nickname}\` for \`${reason}\``, interaction, client);
      } catch(e) {
        return interactionToConsole(`Unable to set ${member.id}'s nickname to \`${nickname}\` (Reason: \`${reason}\`)\n> ${String(e)}`, `nick.js (Line 54)`, interaction, client);
      }
      cooldown.add(interaction.user.id);
      setTimeout(() => {
        cooldown.delete(interaction.user.id);
      }, 5000);
    }
  }
}