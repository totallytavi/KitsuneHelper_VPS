import { CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { KitsuneClient } from "../types.js";

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
 * @param {KitsuneClient} client Client object
 * @param {CommandInteraction} interaction Interaction Object
 * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
 */
export async function run(client: KitsuneClient, interaction: CommandInteraction<'cached'>, options: CommandInteractionOptionResolver) {
  // Make sure the user exists and is in the server
  const member = options.getMember("user") as GuildMember;

  const embed = new EmbedBuilder({
    color: Math.floor(Math.random() * 16777215)
  });
  const roles = member
    ? Array.from(member.roles.cache.sort((a, b) => b.position - a.position).filter(r => r != member.guild.roles.everyone)).map(([, v]) => v.toString())
    : [];
  embed.setTitle(`Information on ${member.user.tag}`);
  embed.setFooter({ text: `ID: ${member.user.id}` });
  embed.setThumbnail(member.user.displayAvatarURL({ size: 2048 }));
  embed.addFields([
    { name: "Register Date", value: `<t:${Math.floor(member.user.createdAt.getTime() / 1000)}:F>`, inline: true },
    { name: "Join Date", value: member ? `<t:${Math.floor(member.joinedAt!.getTime() / 1000)}:F>` : 'Not in this server', inline: true },
    { name: "Nickname", value: `${member.nickname || "None"}`, inline: true },
    { name: "Roles", value: `${roles.length <= 1024 ? roles.join(", ") : "Too many roles!"}`, inline: false },
  ]);

  interaction.editReply({ embeds: [embed] });
}