const { Client, CommandInteraction, CommandInteractionOptionResolver, MessageEmbed } = require(`discord.js`);
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { interactionToConsole, interactionEmbed } = require(`../functions.js`);
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
      const oldName = channel.name;
      const oldParent = channel.parent;
      const oldPosition = channel.rawPosition;
      const oldPermissions = channel.permissionOverwrites;
      let oldNSFW, oldRatelimit, oldTopic, oldBitrate, oldUserlimit;
      switch(channel.type) {
        case `GUILD_TEXT`:
          oldNSFW = channel.nsfw;
          oldRatelimit = channel.rateLimitPerUser;
          oldTopic = channel.topic;
          break;
        case `GUILD_VOICE`:
          oldBitrate = channel.bitrate;
          oldUserlimit = channe.userLimit;
          break;
        default:
          oldNSFW = channel.nsfw;
          oldRatelimit = channel.rateLimitPerUser;
          oldTopic = channel.topic;
          break;
      }
      // Now we can delete the channel
      try {
        await channel.delete(reason);
      } catch(e) {
        return interactionToConsole(`Failed to delete ${channel} (\`${channel.id}\`)\n${e}`, `nuke,js (Line 66)`, interaction, client)
      }
      
      // Now we can create the channel
      switch(channel.type) {
        case `GUILD_TEXT`:
          await interaction.guild.channels.create(oldName, {
            type: channel.type,
            nsfw: oldNSFW,
            parent: oldParent,
            permissionOverwrites: oldPermissions,
            position: oldPosition,
            rateLimitPerUser: oldRatelimit,
            topic: oldTopic,
          })
          .then(channel => channel.send({ embeds: [
            new MessageEmbed()
            .setTitle(`Channel Nuked`)
            .setDescription(`\`${channel.name}\` (\`${channel.id}\`) was nuked by ${interaction.member} (\`${interaction.user.id}\`) for \`${reason}\``)
            .setColor(`#ff0000`)
            .setTimestamp()
          ]}))
          break;
        case `GUILD_VOICE`:
          await interaction.guild.channels.create(oldName, {
            type: channel.type,
            parent: oldParent,
            permissionOverwrites: oldPermissions,
            position: oldPosition,
            bitrate: oldBitrate,
            userLimit: oldUserlimit
          });
          break;
        default:
          await interaction.guild.channels.create(oldName, {
            type: channel.type,
            nsfw: oldNSFW,
            parent: oldParent,
            permissionOverwrites: oldPermissions,
            position: oldPosition,
            rateLimitPerUser: oldRatelimit,
            topic: oldTopic,
          })
          .then(channel => channel.send({ embeds: [
            new MessageEmbed()
            .setTitle(`Channel Nuked`)
            .setDescription(`\`${channel.name}\` (\`${channel.id}\`) was nuked by ${interaction.member} (\`${interaction.user.id}\`) for \`${reason}\``)
            .setColor(`#ff0000`)
            .setTimestamp()
          ]}))
          break;
      }

      cooldown.add(interaction.user.id);
      setTimeout(() => {
        cooldown.delete(interaction.user.id);
      }, 5000);
    }
  }
}