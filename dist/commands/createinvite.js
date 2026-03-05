// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder } from "@discordjs/builders";
import { InteractionContextType } from "discord-api-types/v9";
import { ButtonBuilder, ButtonStyle } from "discord.js";
import { awaitButtons, interactionEmbed } from "../functions.js";
export const name = "createinvite";
export const data = new SlashCommandBuilder()
    .setName("createinvite")
    .setDescription("Creates an invite for a certain channel in your forest")
    .addChannelOption((option) => {
    return option
        .setName("channel")
        .setDescription("The channel to create the invite for (Default: This channel)")
        .setRequired(false);
})
    .addIntegerOption((option) => {
    return option
        .setName("age")
        .setDescription("How many days should the invite last (Default: Unlimited)")
        .setRequired(false)
        .addChoices({ name: "1hour", value: 3600 }, { name: "1day", value: 86400 }, { name: "1week", value: 604800 }, { name: "forever", value: 0 });
})
    .addIntegerOption((option) => {
    return option
        .setName("max_uses")
        .setDescription("The amount of magicians that can use this invite (Default: Unlimited)")
        .setRequired(false);
})
    .addBooleanOption((option) => {
    return option
        .setName("temporary_membership")
        .setDescription("Should the magician be kicked 24 hours after joining if they have no roles? (Default: False)")
        .setRequired(false);
})
    .setContexts(InteractionContextType.Guild);
/**
 * @param {Client} client Client object
 * @param {CommandInteraction} interaction Interaction Object
 * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
 */
export async function run(client, interaction, options) {
    const channel = (options.getChannel("channel") ?? interaction.channel);
    const age = options.getInteger("age") ?? 0;
    const max_uses = options.getInteger("max_uses") ?? 0;
    const temporary_membership = options.getBoolean("temporary_membership") ?? false;
    const buttons = [
        new ButtonBuilder()
            .setCustomId("yes")
            .setLabel("Yes, I want to create an invite")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId("no")
            .setLabel("No, I do not want to create an invite")
            .setStyle(ButtonStyle.Danger)
    ];
    const confirmation = await awaitButtons(interaction, 15, buttons, "Are you sure you want to create an invite?", true);
    if (!confirmation)
        return interaction.followUp({ content: "The spell has been cancelled! No magic was performed" });
    if (confirmation.customId === "yes") {
        if (!interaction.member.permissionsIn(channel.id).has("CreateInstantInvite"))
            return interactionEmbed(3, "[ERR-UPRM]", `Missing: \`Create Instant Invite\` > ${channel}`, interaction, client, true);
        if (!interaction.guild.members.me.permissionsIn(channel.id).has("CreateInstantInvite"))
            return interactionEmbed(3, "[ERR-BPRM]", `Missing: \`Create Instant Invite\` > ${channel}`, interaction, client, true);
        const invite = await channel.createInvite({ maxAge: age, maxUses: max_uses, temporary: temporary_membership, reason: `Created on behalf of user ID: ${interaction.user.id}` });
        return interactionEmbed(1, `Here is the invite:\nhttps://discord.gg/${invite.code}`, "", interaction, client, false);
    }
    else {
        return interaction.followUp({ content: "The spell has been cancelled! No magic was performed", components: [] });
    }
}
