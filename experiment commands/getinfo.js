const { Client, CommandInteraction, CommandInteractionOptionResolver, MessageEmbed } = require(`discord.js`);
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { interactionEmbed } = require(`../functions.js`);
const cooldown = new Set();

module.exports = {
  name: `getinfo`,
  data: new SlashCommandBuilder()
  .setName(`getinfo`)
  .setDescription(`Shows information about a server, user, role, or channel`)
  .addSubcommandGroup(group => {
    group
    .setName(`user`)
    .setDescription(`Get information regarding user`)
    .addSubcommand(command => {
      command
      .setName(`userinfo`)
      .setDescription(`Information about a user`)
      .addUserOption(option => {
        option
        .setName(`user`)
        .setDescription(`The user to get information from`)
        .setRequired(true)
      })
      .addStringOption(option => {
        option
        .setName(`type`)
        .setDescription(`Type of information to get`)
        .addChoices([
          [`server`, `local`],
          [`global`, `global`]
        ])
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      command
      .setName(`permissions`)
      .setDescription(`Shows you a user's permissions in a certain channel`)
      .addUserOption(option => {
        option
        .setName(`user`)
        .setDescription(`The user to get information from`)
        .setRequired(true)
      })
      .addChannelOption(option => {
        option
        .setName(`channel`)
        .setDescription(`The channel to get the permissions from`)
        .setRequired(true)
      })
    })
  })
  .addSubcommandGroup(group => {
    group
    .setName(`server`)
    .setDescription(`Gets permissions for roles, channels, or the server`)
    .addSubcommand(command => {
      command
      .setName(`roleinfo`)
      .setDescription(`Shows a role's information`)
      .addRoleOption(option => {
        option
        .setName(`role`)
        .setDescription(`The role to get information from`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      command
      .setName(`roles_channelpermissions`)
      .setDescription(`Shows a role's permissions in a channel`)
      .addRoleOption(option => {
        option
        .setName(`role`)
        .setDescription(`The role to check permissions for`)
        .setRequired(true)
      })
      .addChannelOption(option => {
        option
        .setName(`channel`)
        .setDescription(`The channel to get permissions from`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      command
      .setName(`channelinfo`)
      .setDescription(`Shows a channel's information`)
      .addChannelOption(option => {
        option
        .setName(`channel`)
        .setDescription(`The channel to get information from`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      command
      .setName(`serverinfo`)
      .setDescription(`Shows information about the server`)
      .addStringOption(option => {
        option
        .setName(`information`)
        .setDescription(`Type of information to show`)
        .addChoices([
          [`basic`, `basic`],
          [`advanced`, `advanced`]
        ])
      })
    })
  }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
   */
  run: async (client, interaction, options) => {
    if(cooldown.has(interaction.member.id)) {
      return interactionEmbed(2, `[ERR-CLD]`, interaction, client, true);
    } else {
      const subcommand = options._subcommand;
      const embed = new MessageEmbed();

      switch(options.group) {
        case `user`:
          switch(subcommand) {
            case `userinfo`:
              interaction.editReply({ embeds: [embed]})
          }
          break;
        case `server`:
          switch(subcommand) {

          }
          break;
      }

      cooldown.add(interaction.member.id);
      setTimeout(() => {
        cooldown.delete(interaction.member.id);
      }, 5000)
    }
  }
}