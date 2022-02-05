const { SlashCommandBuilder } = require("@discordjs/builders");
// eslint-disable-next-line no-unused-vars
const { Client, CommandInteraction, CommandInteractionOptionResolver, MessageButton } = require("discord.js");
const { interactionEmbed, awaitButtons } = require("../functions.js");

module.exports = {
  name: "kick",
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Boots a user from the forest")
    .addUserOption(option => {
      return option
        .setName("user")
        .setDescription("The magician to be removed")
        .setRequired(true);
    })
    .addStringOption(option => {
      return option
        .setName("reason")
        .setDescription("The reason for removing the magician")
        .setRequired(false);
    }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
   */
  run: async (client, interaction, options) => {
    const member = options.getMember("user");
    const reason = options.getString("reason") ?? "No reason provided";

    if(!interaction.member.permissions.has("KICK_MEMBERS")) return interactionEmbed(3, "[ERR-UPRM]", "Missing: `Kick Members`", interaction, client, true);
    if(!interaction.guild.me.permissions.has("KICK_MEMBERS")) return interactionEmbed(3, "[ERR-UPRM]", "Missing: `Kick Members`", interaction, client, true);
    if(interaction.user.id === member.user.id) return interactionEmbed(3, "[ERR-ARGS]", "Arg: member :-: Expected other user, got same user", interaction, client, true);
    if(interaction.member.roles.highest.rawPosition <= member.roles.highest.rawPosition) return interactionEmbed(3, "[ERR-ARGS]", "Arg: member :-: Expected user lower than executor, got user at or above executor", interaction, client, true);
    if(interaction.guild.me.roles.highest.rawPosition <= member.roles.highest.rawPosition) return interactionEmbed(3, "[ERR-ARGS]", "Arg: member :-: Expected user lower than bot, got user at or above bot", interaction, client, true);

    const confirmation = await awaitButtons(interaction, 15, [new MessageButton({ customId: "yes", label: "Yes, I want to kick the magician", style: "DANGER" }), new MessageButton({ customId: "no", label: "No, I do not want to kick the magician", style: "SUCCESS" })], "Are you sure you want to kick this magician?", true);
    if(confirmation.customId === "yes") {
      await member.kick(`${reason} (Moderator ID: ${interaction.user.id})`);
      const result = await client.connection.execute("INSERT INTO Kicks(kickId, guildId, userId, modId, reason) VALUES(?, ?, ?, ?, ?)", [Buffer.from(String(Date.now())).toString("base64"), interaction.guild.id, member.user.id, interaction.user.id, reason])
        .catch(e => interactionEmbed(3, "[SQL-ERR]", "[" + e.code + "] " + e.message, interaction, client, false));
      if(!result) return;
      client.event.emit("query", `${result[0], __filename.split("/")[__filename.split("/").length - 1]} 41:53`);
      return interactionEmbed(1, `${member} was kicked for \`${reason}\`.`, "", interaction, client, false);
    } else {
      interaction.editReply({ content: ":x: Banishment cancelled, the magician remains in your forest!" });
    }
  }
};