const { Client, CommandInteraction, CommandInteractionOptionResolver } = require(`discord.js`);
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { interactionToConsole, interactionEmbed } = require(`../functions.js`);
const fs = require(`fs`);
const cooldown = new Set();

module.exports = {
  name: `editchannel`,
  data: new SlashCommandBuilder()
  .setName(`editchannel`)
  .setDescription(`Edits a channel's data`)
  .addSubcommandGroup(group => {
    return group
    .setName(`text`)
    .setDescription(`Text channel options`)
    .addSubcommand(command => {
      return command
      .setName(`name`)
      .setDescription(`Sets a channel's name`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`Channel to be updated`)
        .setRequired(true)
      })
      .addStringOption(option => {
        return option
        .setName(`name`)
        .setDescription(`New name`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      return command
      .setName(`topic`)
      .setDescription(`Sets a channel's topic`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`Channel to be updated`)
        .setRequired(true)
      })
      .addStringOption(option => {
        return option
        .setName(`topic`)
        .setDescription(`New topic`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      return command
      .setName(`nsfw`)
      .setDescription(`Changes a channel's NSFW flag`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`Channel to be updated`)
        .setRequired(true)
      })
      .addBooleanOption(option => {
        return option
        .setName(`nsfw`)
        .setDescription(`New NSFW flag`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      return command
      .setName(`slowmode`)
      .setDescription(`Changes a channel's slowmode`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`Channel to be updated`)
        .setRequired(true)
      })
      .addNumberOption(option => {
        return option
        .setName(`seconds`)
        .setDescription(`Slowmode in seconds`)
        .setRequired(true)
      })
    })
  })
  .addSubcommandGroup(group => {
    return group
    .setName(`voice`)
    .setDescription(`Voice channel options`)
    .addSubcommand(command => {
      return command
      .setName(`name`)
      .setDescription(`Sets a channel's name`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`Channel to be updated`)
        .setRequired(true)
      })
      .addStringOption(option => {
        return option
        .setName(`name`)
        .setDescription(`New name`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      return command
      .setName(`user_limit`)
      .setDescription(`Sets the user limit`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`Channel to be updated`)
        .setRequired(true)
      })
      .addNumberOption(option => {
        return option
        .setName(`limit`)
        .setDescription(`New user limit`)
        .setRequired(true)
        .addChoices([
          [`no_limit`, 0],
          [`1`, 1],
          [`2`, 2],
          [`5`, 5],
          [`10`, 10],
          [`25`, 25],
          [`45`, 45],
          [`50`, 50],
          [`75`, 75],
          [`90`, 90],
          [`99`, 99]
        ])
      })
    })
    .addSubcommand(command => {
      return command
      .setName(`bitrate`)
      .setDescription(`Changes a channel's voice quality`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`Channel to be updated`)
        .setRequired(true)
      })
      .addStringOption(option => {
        return option
        .setName(`bitrate`)
        .setDescription(`New channel bitrate (64kbps is default and recommended)`)
        .setRequired(true)
        .addChoices([
          [`8kbps`, 8],
          [`16kbps`, 16],
          [`32kbps`, 32],
          [`64kbps`, 64],
          [`96kbps`, 96],
          [`128kbps`, 128],
          [`256kbps`, 256],
          [`384kbps`, 384]
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
    if(cooldown.has(interaction.user.id)) {
      return interactionEmbed(2, `[ERR-CLD]`, interaction, client)
    } else {
      interactionEmbed(4, `[INFO-DEV]`, interaction, client);
      console.log(interaction)
      fs.writeFileSync(`../console.txt`, interaction.toString());

      cooldown.add(interaction.user.id);
      setTimeout(() => {
        cooldown.delete(interaction.user.id);
      }, 5000);
    }
  }
}