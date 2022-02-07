// eslint-disable-next-line no-unused-vars
const { Client, CommandInteraction, CommandInteractionOptionResolver, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { interactionEmbed, awaitButtons } = require("../functions.js");

module.exports = {
  name: "nickname",
  data: new SlashCommandBuilder()
    .setName("nickname")
    .setDescription("Changes yours, the bot's, or another user's nickname")
    .addUserOption(option => {
      return option
        .setName("user")
        .setDescription("The user whose nickname you want to change")
        .setRequired(true);
    })
    .addStringOption(option => {
      return option
        .setName("new_nickname")
        .setDescription("The nickname to apply (Maximum length of 32 characters)")
        .setRequired(true);
    })
    .addStringOption(option => {
      return option
        .setName("reason")
        .setDescription("The reason you are changing their nickname")
        .setRequired(false);
    }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
   */
  run: async (client, interaction, options) => {
    const member = options.getMember("user");
    const nickname = options.getString("new_nickname");
    const reason = options.getString("reason") ?? "No reason provided";

    if(member === interaction.guild.me) {
      if(!interaction.guild.me.permissions.has("CHANGE_NICKNAME")) return interactionEmbed(3, "[ERR-BPRM]", "Missing: `Change Nickname`", interaction, client, true);
    } else if(member === interaction.member) {
      if(!interaction.member.permissions.has("CHANGE_NICKNAME")) return interactionEmbed(3, "[ERR-UPRM]", "Missing: `Change Nickname`", interaction, client, true);
      if(!interaction.guild.me.permissions.has("MANAGE_NICKNAMES")) return interactionEmbed(3, "[ERR-BPRM]", "Missing: `Manage Nicknames`", interaction, client, true);
    } else {
      if(!interaction.guild.me.permissions.has("MANAGE_NICKNAMES")) return interactionEmbed(3, "[ERR-BPRM]", "Missing: `Manage Nicknames`", interaction, client, true);
    }
    // If we can't manage them, reject it.
    if(!member.manageable && member != interaction.guild.me) return interactionEmbed(3, "[ERR-BPRM]", "I cannot change nicknames of those higher or equal to me", interaction, client, true);
    // If they can't manage them, reject it.
    if(member.roles.highest.rawPosition >= interaction.member.roles.highest.rawPosition) return interactionEmbed(3, "[ERR-UPRM]", "You cannot change nicknames of those higher or equal to you", interaction, client, true);
    // If the nickname is too long, reject it.
    if(nickname.length > 32) return interactionEmbed(3, "[ERR-ARGS]", "Arg: new_nickname :-: Expected String.length < 32, got String.length > 32", interaction, client, true);

    // Create an Array of buttons.
    const buttons = [
      new MessageButton().setLabel("Yes").setCustomId("yes").setStyle("SUCCESS"),
      new MessageButton().setLabel("No").setCustomId("no").setStyle("DANGER")
    ];
    // Get the response from them
    const button = await awaitButtons(interaction, 10, buttons, `Confirm you wish to change ${member}'s nickname?`, true);
    // Reaction!
    if(button.customId === "yes") {
      // If they pressed the Yes button, act.
      await member.setNickname(nickname, `${reason} (Moderator ID: ${interaction.member.id})`);
      interactionEmbed(1, `Updated ${member}'s (${member.id}) nickname to \`${nickname}\` for \`${reason}\``, "", interaction, client, false);
    } else {
      // If they pressed the No button or didn't respond, reject it.
      interaction.editReply(":negative_squared_cross_mark: Spell cancelled! No need to worry");
    }
  }
};