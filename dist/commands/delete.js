const { SlashCommandBuilder } = require("@discordjs/builders");
// eslint-disable-next-line no-unused-vars
const { Client, CommandInteraction, CommandInteractionOptionResolver, MessageButton } = require("discord.js");
const { interactionEmbed, awaitButtons } = require("../functions.js");
module.exports = {
    name: "delete",
    data: new SlashCommandBuilder()
        .setName("delete")
        .setDescription("Deletes certain items from the forest")
        .addSubcommand(command => {
        return command
            .setName("channel")
            .setDescription("Deletes a channel from the forest")
            .addChannelOption(option => {
            return option
                .setName("channel")
                .setDescription("The channel to delete")
                .setRequired(true);
        })
            .addStringOption(option => {
            return option
                .setName("reason")
                .setDescription("Reason for deleting the channel")
                .setRequired(false);
        });
    })
        .addSubcommand(command => {
        return command
            .setName("role")
            .setDescription("Removes a role from the forest")
            .addRoleOption(option => {
            return option
                .setName("role")
                .setDescription("The role to delete")
                .setRequired(true);
        })
            .addStringOption(option => {
            return option
                .setName("reason")
                .setDescription("Reason for deleting the role")
                .setRequired(false);
        });
    }),
    /**
     * @param {Client} client Client object
     * @param {CommandInteraction} interaction Interaction Object
     * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
     */
    run: async (client, interaction, options) => {
        const subcommand = options.getSubcommand();
        const option = options.getChannel("channel") || options.getRole("role");
        const reason = options.getString("reason") ?? "No reason provided";
        const confirmation = await awaitButtons(interaction, 15, [new MessageButton({ customId: "yes", label: "Yes, I want to continue", style: "DANGER" }), new MessageButton({ customId: "no", label: "No, I don't want to continue", style: "PRIMARY" })], "Are you sure you want to continue with deletion? This is irreversible!", true);
        if (confirmation.customId === "yes") {
            if (subcommand === "channel") {
                if (!interaction.member.permissionsIn(option).has("MANAGE_CHANNELS"))
                    return interactionEmbed(3, "[ERR-UPRM]", `Missing: \`Manage Channels\` > ${option}`, interaction, client, true);
                if (!interaction.guild.me.permissionsIn(option).has("MANAGE_CHANNELS"))
                    return interactionEmbed(3, "[ERR-BRPM]", `Missing: \`Manage Channels\` > ${option}`, interaction, client, true);
                await option.delete(`${reason} (Moderator ID: ${interaction.user.id})`);
                return interactionEmbed(1, `Successfully removed channel: ${option.name} (${option.id})`, "", interaction, client, true);
            }
            else if (subcommand === "role") {
                if (!interaction.member.permissions.has("MANAGE_ROLES"))
                    return interactionEmbed(3, "[ERR-UPRM]", "Missing: `Manage Roles`", interaction, client, true);
                if (!interaction.guild.me.permissions.has("MANAGE_ROLES"))
                    return interactionEmbed(3, "[ERR-BRPM]", "Missing: `Manage Roles`", interaction, client, true);
                await option.delete(`${reason} (Moderator ID: ${interaction.user.id})`);
                return interactionEmbed(1, `Successfully removed role: ${option.name} (${option.id})`, "", interaction, client, true);
            }
        }
        else {
            return interaction.followUp({ content: "The spell has been cancelled! No magic was performed" });
        }
    }
};
