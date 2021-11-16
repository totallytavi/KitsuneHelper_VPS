const { Client, CommandInteraction, CommandInteractionOptionResolver, MessageEmbed } = require(`discord.js`);
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { interactionToConsole, interactionEmbed, promptMessage } = require(`../functions.js`);
const cooldown = new Set();

module.exports = {
  name: `nuke`,
  data: new SlashCommandBuilder()
  .setName(`nuke`)
  .setDescription(`Deletes and recreates a channel, clearing all messages`)
  .addChannelOption(option => {
    return option
    .setName(`channel`)
    .setDescription(`The channel to nuke`)
    .setRequired(true)
  })
  .addStringOption(option => {
    return option
    .setName(`reason`)
    .setDescription(`The reason for the nuke`)
    .setRequired(false)
  }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
   */
  run: async (client, interaction, options) => {
    if (cooldown.has(interaction.user.id)) {
      return interactionEmbed(2, `[ERR-CLD]`, interaction, client, true);
    } else {
      const channel = options.getChannel("channel");
      if(!interaction.member.permissionsIn(channel).has(`MANAGE_CHANNEL`)) {
        return interactionEmbed(3, `[ERR-UPRM]`, interaction, client, true);
      }
      if(!interaction.guild.me.permissionsIn(channel).has(`MANAGE_CHANNEL`)) {
        return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, true);
      }
      if(channel.parent && !interaction.guild.me.permissionsIn(channel.parent).has(`MANAGE_CHANNEL`)) {
        return interactionEmbed(3, `[ERR-BPRM]`, interaction, client, true);
      }

      // Now just a long list of grabbing values
      const reason = options.getString(`reason`) ?? `No reason provided`;
      const oldName = channel.name;
      const oldParent = channel.parent;
      const oldPosition = channel.rawPosition;
      const oldPermissions = channel.permissionOverwrites.cache;
      let oldNSFW, oldRatelimit, oldTopic, oldBitrate, oldUserlimit, oldType;
      switch(channel.type) {
        case `GUILD_TEXT`:
          oldNSFW = channel.nsfw;
          oldRatelimit = channel.rateLimitPerUser;
          oldTopic = channel.topic;
          oldType = channel.oldType;
          break;
        case `GUILD_VOICE`:
          oldBitrate = channel.bitrate;
          oldUserlimit = channe.userLimit;
          oldType = channel.oldType;
          break;
        default:
          oldNSFW = channel.nsfw;
          oldRatelimit = channel.rateLimitPerUser;
          oldTopic = channel.topic;
          oldType = channel.oldType;
          break;
      }

      // Create an Array of buttons.
      const buttons = [
        new MessageButton().setLabel(`Yes`).setCustomId(`yes`).setStyle(`SUCCESS`),
        new MessageButton().setLabel(`No`).setCustomId(`no`).setStyle(`DANGER`)
      ];
      // Get the response from them
      const button = await promptMessage(interaction, 10, buttons, `Confirm you wish to nuke ${channel}?`);
      // Reaction!
      if(button.customId === `yes`) {
        // Now we can delete the channel
        try {
          await channel.delete(`${reason} (Moderator ID: ${interaction.user.id})`);
        } catch(e) {
          return interactionToConsole(`Failed to delete ${channel} (\`${channel.id}\`)\n${e}`, `nuke,js (Line 66)`, interaction, client)
        }
      } else {
        // If they pressed the No button or didn't respond, reject it.
        interaction.editReply(`:negative_squared_cross_mark: Spell cancelled! No need to worry`)
      }
      
      // Now we can create the channel
      switch(oldType) {
        case `GUILD_TEXT`:
          interaction.guild.channels.create(oldName, {
            type: oldType,
            nsfw: oldNSFW,
            parent: oldParent,
            permissionOverwrites: oldPermissions,
            position: oldPosition,
            rateLimitPerUser: oldRatelimit,
            topic: oldTopic,
          })
          .then(channel => channel.send({
            embeds: [
              new MessageEmbed()
              .setTitle(`Channel Nuked`)
              .setDescription(`\`${channel.name}\` (\`${channel.id}\`) was nuked by ${interaction.member} (\`${interaction.user.id}\`) for \`${reason}\``)
              .setColor(`#ff0000`)
              .setTimestamp()
            ]
          }))
          break;
        case `GUILD_VOICE`:
          interaction.guild.channels.create(oldName, {
            type: oldType,
            parent: oldParent,
            permissionOverwrites: oldPermissions,
            position: oldPosition,
            bitrate: oldBitrate,
            userLimit: oldUserlimit
          });
          break;
        default:
          interaction.guild.channels.create(oldName, {
            type: oldType,
            nsfw: oldNSFW,
            parent: oldParent,
            permissionOverwrites: oldPermissions,
            position: oldPosition,
            rateLimitPerUser: oldRatelimit,
            topic: oldTopic,
          })
          .then(channel => channel.send({
            embeds: [
              new MessageEmbed()
              .setTitle(`Channel Nuked`)
              .setDescription(`\`${channel.name}\` (\`${channel.id}\`) was nuked by ${interaction.member} (\`${interaction.user.id}\`) for \`${reason}\``)
              .setColor(`#ff0000`)
              .setTimestamp()
            ]
          }))
          break;
      }

      cooldown.add(interaction.user.id);
      await interaction.editReply(`My magic has worked and the result is below!`)
      setTimeout(() => {
        cooldown.delete(interaction.user.id);
      }, 5000);
    }
  }
}