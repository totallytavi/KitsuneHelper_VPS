import { Client, CommandInteraction, CommandInteractionOptionResolver, MessageEmbed, SlashCommandBuilder } from "discord.js";
import moment from "moment";
import { interactionEmbed } from "../functions.js";

export const name = "userinfo";
export const ephemeral = false;
export const data = new SlashCommandBuilder()
  .setName("userinfo")
  .setDescription("Gets information about a user")
  .addUserOption(option => {
    return option
      .setName("user")
      .setDescription("The user to get information about")
      .setRequired(true);
  });
/**
 * @param {Client} client Client object
 * @param {CommandInteraction} interaction Interaction Object
 * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
 */
export async function run(client, interaction, options) {
  // Make sure the user exists and is in the server
  const member = options.getMember("user");
  if (!member) return interactionEmbed(3, "[ERR-ARGS]", "That user does not exist in this server (Check your mutuals with them)", interaction, client, [true, 10]);

  const embed = new MessageEmbed({
    color: Math.floor(Math.random() * 16777215)
  });
  const roles = Array.from(member.roles.cache.sort((a, b) => b.position - a.position).filter(r => r != member.guild.roles.everyone)).map(([, v]) => v.toString());
  embed.setTitle(`Information on ${member.user.tag}`);
  embed.setFooter({ text: `ID: ${member.user.id}` });
  embed.setThumbnail(member.user.displayAvatarURL({ format: "png", size: 2048, dynamic: true }));
  embed.addFields([
    { name: "Register Date", value: String(moment(member.user.createdAt)._i), inline: true },
    { name: "Join Date", value: String(moment(member.joinedAt)._i), inline: true },
    { name: "Nickname", value: `${member.nickname || "None"}`, inline: true },
    { name: "Roles", value: `${JSON.stringify(roles).length < 1024 ? roles.join(", ") : "Too many roles!"}`, inline: false },
  ]);

  interaction.editReply({ embeds: [embed] });
}