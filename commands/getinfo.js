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
    return group
    .setName(`user`)
    .setDescription(`Get information regarding user`)
    .addSubcommand(command => {
      return command
      .setName(`userinfo`)
      .setDescription(`Information about a user`)
      .addUserOption(option => {
        return option
        .setName(`user`)
        .setDescription(`The user to get information from`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      return command
      .setName(`permissions`)
      .setDescription(`Shows you a user's permissions in a certain channel`)
      .addUserOption(option => {
        return option
        .setName(`user`)
        .setDescription(`The user to get information from`)
        .setRequired(true)
      })
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`The channel to get the permissions from`)
        .setRequired(true)
      })
    })
  })
  .addSubcommandGroup(group => {
    return group
    .setName(`server`)
    .setDescription(`Gets permissions for roles, channels, or the server`)
    .addSubcommand(command => {
      return command
      .setName(`roleinfo`)
      .setDescription(`Shows a role's information`)
      .addRoleOption(option => {
        return option
        .setName(`role`)
        .setDescription(`The role to get information from`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      return command
      .setName(`roles_channelpermissions`)
      .setDescription(`Shows a role's permissions in a channel`)
      .addRoleOption(option => {
        return option
        .setName(`role`)
        .setDescription(`The role to check permissions for`)
        .setRequired(true)
      })
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`The channel to get permissions from`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      return command
      .setName(`channelinfo`)
      .setDescription(`Shows a channel's information`)
      .addChannelOption(option => {
        return option
        .setName(`channel`)
        .setDescription(`The channel to get information from`)
        .setRequired(true)
      })
    })
    .addSubcommand(command => {
      return command
      .setName(`serverinfo`)
      .setDescription(`Shows information about the server`)
      .addStringOption(option => {
        return option
        .setName(`information`)
        .setDescription(`Type of information to show`)
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
      return interactionEmbed(2, `[ERR-CLD]`, interaction, client);
    } else {
      const subcommand = options._subcommand;
      let option, permissions, ser, channel, role, embed;

      switch(options._group) {
        case `user`:
          option = options.getMember(`user`);
          switch(subcommand) {
            case `userinfo`:
              interaction.followUp({ embeds: [
                new MessageEmbed()
                .setTitle(`User Information for ${option.displayName}`)
                .addFields(
                  { name: `Account Creation`, value: `<t:${Math.floor(option.user.createdTimestamp/1000)}:F>\n(<t:${Math.floor(option.user.createdTimestamp/1000)}:R>)`, inline: true },
                  { name: `Joined Server`, value: `<t:${Math.floor(option.joinedTimestamp/1000)}:F>\n(<t:${Math.floor(option.joinedTimestamp/1000)}:R>)`, inline: true },
                  { name: `Highest Role`, value: `${option.roles.highest} (${option.roles.highest.id})`, inline: true },
                  { name: `User ID`, value: `${option.user.id}`, inline: true },
                  { name: `Nickname`, value: `${option.nickname || `None`}`, inline: true },
                  { name: `Roles (${option.roles.cache.size})`, value: Array.from(option.roles.cache.entries()).sort((a,b) => a[1].rawPosition - b[1].rawPosition).map(r => `<@&${r[1].id}>`).join("\n") || `None`, inline: false }
                )
              ], ephemeral: false });
              break;
            case `permissions`:
              channel = options.getChannel(`channel`);
              permissions = option.permissionsIn(channel);
              ser = permissions.serialize();
              let array = new Array();
              if(channel.type != `GUILD_TEXT` || channel.type != `GUILD_VOICE`) {
                interactionEmbed(3, `[ERR-ARGS]`, interaction, client, true);
                break;
              }
              ser.hasOwnProperty("CONNECT") ? array.push(
                [`Edit Channel`, ser.MANAGE_CHANNELS],
                [`Edit Permissions`, ser.MANAGE_ROLES],
                [`Manage Messages`, ser.MANAGE_MESSAGES],
                [`View Channel`, ser.VIEW_CHANNEL],
                [`Send Messages`, ser.SEND_MESSAGES],
                [`Embed Links`, ser.EMBED_LINKS],
                [`Attach Files`, ser.ATTACH_FILES],
                [`Read Message History`, ser.READ_MESSAGE_HISTORY],
                [`Mention Everyone and All Roles`, ser.MENTION_EVERYONE],
                [`Use External Emojis`, ser.USE_EXTERNAL_EMOJIS],
                [`Add Reactions`, ser.ADD_REACTIONS],
                [`Invite People`, ser.CREATE_INSTANT_INVITE]
              ) : array.push(
                [`Edit Channel`, ser.MANAGE_CHANNELS],
                [`Edit Permissions`, ser.MANAGE_ROLES],
                [`View Channel`, ser.VIEW_CHANNEL],
                [`Connect`, ser.CONNECT],
                [`Speak`, ser.SPEAK],
                [`Mute Members`, ser.MUTE_MEMBERS],
                [`Deafen Members`, ser.DEAFEN_MEMBERS],
                [`Move Members Into This Channel`, ser.MOVE_MEMBERS],
                [`Use Voice Activity`, ser.USE_VAD],
                [`Priority Speaker`, ser.PRIORITY_SPEAKER],
                [`Use Screenshare and Camera`, ser.STREAM],
                [`Invite People`, ser.CREATE_INSTANT_INVITE]
              ).map(x => `${x[0]}: ${x[1] ? `\`✅\`` : `\`❎\``}`);

              interaction.followUp({ embeds: [
                new MessageEmbed()
                .setTitle(`Permissions for ${option.displayName} in ${channel.name}`)
                .setDescription(array.join(`\n`))
              ], ephemeral: false });
              break;
          }
          break;
        case `server`:
          case `roleinfo`:
            option = options.getRole(`role`);
            permissions = option.permissions
            ser = permissions.serialize();
            let array = new Array(
              [`Administrator`, ser.ADMINISTRATOR],
              [`Manage Server`, ser.MANAGE_SERVER],
              [`Manage Roles`, ser.MANAGE_ROLES],
              [`Manage Channels`, ser.MANAGE_CHANNELS],
              [`Manage Emojis and Stickers`, ser.MANAGE_EMOJIS],
              [`Manage Webhooks`, ser.MANAGE_WEBHOOKS],
              [`Manage Messages`, ser.MANAGE_MESSAGES],
              [`View Channel`, ser.VIEW_CHANNEL],
              [`Send Messages`, ser.SEND_MESSAGES],
              [`Embed Links`, ser.EMBED_LINKS],
              [`Attach Files`, ser.ATTACH_FILES],
              [`Read Message History`, ser.READ_MESSAGE_HISTORY],
              [`Mention Everyone and All Roles`, ser.MENTION_EVERYONE],
              [`Use External Emojis`, ser.USE_EXTERNAL_EMOJIS],
              [`Add Reactions`, ser.ADD_REACTIONS],
              [`Connect`, ser.CONNECT],
              [`Speak`, ser.SPEAK],
              [`Use Voice Activity`, ser.USE_VAD],
              [`Mute Members`, ser.MUTE_MEMBERS],
              [`Deafen Members`, ser.DEAFEN_MEMBERS],
              [`Move Members Into This Channel`, ser.MOVE_MEMBERS],
              [`Priority Speaker`, ser.PRIORITY_SPEAKER],
              [`Use Screenshare and Camera`, ser.STREAM]
            ).map(x => `${x[0]}: ${x[1] ? `\`✅\`` : `\`❎\``}`);
            interaction.followUp({ embeds: [
              new MessageEmbed()
              .setTitle(`Permissions for ${option.name}`)
              .addFields(
                { name: `Name`, value: option.name, inline: true },
                { name: `ID`, value: option.id, inline: true },
                { name: `Hex`, inline: option.hexColor, inline: false },
                { name: `Permissions`, value: array.join(`\n`) }
              )
            ], ephemeral: false });
            break;
          case `roles_channelpermissions`:
            role = options.getRole(`role`);
            channel = options.getChannel(`channel`);
            permissions = role.permissionsIn(channel);
            ser = permissions.serialize();

            if(channel.type != `GUILD_TEXT` || channel.type != `GUILD_VOICE`) {
              interactionEmbed(3, `[ERR-ARGS]`, interaction, client, true);
              break;
            }
            ser.hasOwnProperty("CONNECT") ? array.push(
              [`Edit Channel`, ser.MANAGE_CHANNELS],
              [`Edit Permissions`, ser.MANAGE_ROLES],
              [`Manage Messages`, ser.MANAGE_MESSAGES],
              [`View Channel`, ser.VIEW_CHANNEL],
              [`Send Messages`, ser.SEND_MESSAGES],
              [`Embed Links`, ser.EMBED_LINKS],
              [`Attach Files`, ser.ATTACH_FILES],
              [`Read Message History`, ser.READ_MESSAGE_HISTORY],
              [`Mention Everyone and All Roles`, ser.MENTION_EVERYONE],
              [`Use External Emojis`, ser.USE_EXTERNAL_EMOJIS],
              [`Add Reactions`, ser.ADD_REACTIONS],
              [`Invite People`, ser.CREATE_INSTANT_INVITE]
            ) : array.push(
              [`Edit Channel`, ser.MANAGE_CHANNELS],
              [`Edit Permissions`, ser.MANAGE_ROLES],
              [`View Channel`, ser.VIEW_CHANNEL],
              [`Connect`, ser.CONNECT],
              [`Speak`, ser.SPEAK],
              [`Mute Members`, ser.MUTE_MEMBERS],
              [`Deafen Members`, ser.DEAFEN_MEMBERS],
              [`Move Members Into This Channel`, ser.MOVE_MEMBERS],
              [`Use Voice Activity`, ser.USE_VAD],
              [`Priority Speaker`, ser.PRIORITY_SPEAKER],
              [`Use Screenshare and Camera`, ser.STREAM],
              [`Invite People`, ser.CREATE_INSTANT_INVITE]
            ).map(x => `${x[0]}: ${x[1] ? `\`✅\`` : `\`❎\``}`);

            interaction.followUp({ embeds: [
              new MessageEmbed()
              .setTitle(`Permissions for ${option.displayName} in ${channel.name}`)
              .setDescription(array.join(`\n`))
            ], ephemeral: false });
            break;
          case `channelinfo`:
            channel = options.getChannel(`channel`);
            if(channel.type != `GUILD_TEXT` || channel.type != `GUILD_VOICE`) {
              interactionEmbed(3, `[ERR-ARGS]`, interaction, client, true);
              break;
            }
            embed = channel.type === `GUILD_TEXT` ? new MessageEmbed()
            .setTitle(`Channel Information for ${channel.name}`)
            .addFields(
              { name: `Name`, value: channel.name, inline: true },
              { name: `ID`, value: channel.id, inline: true },
              { name: `Synced with Category?`, value: channel.permissionsLocked, inline: true },
              { name: `Topic`, value: channel.topic, inline: true },
              { name: `NSFW?`, value: channel.nsfw, inline: true }
            ) : new MessageEmbed()
            .setTitle(`Channel Information for ${channel.name}`)
            .addFields(
              { name: `Name`, value: channel.name, inline: true },
              { name: `ID`, value: channel.id, inline: true },
              { name: `Synced with Category?`, value: channel.permissionsLocked, inline: true },
              { name: `Creation Date`, value: `<t:${Math.floor(channel.createdTimestamp/1000)}:F> (<t:${Math.floor(channel.createdTimestamp/1000)}:R>)`, inline: true },
              { name: `Bitrate`, value: `${channel.bitrate} kbps`, inline: true },
              { name: `User Limit`, value: channel.userLimit, inline: true }
            )
            interaction.followUp({ embeds: [embed], ephemeral: false });
            break;
          case `serverinfo`:
            const server = options.getServer(`server`);
            const embed = new MessageEmbed()
            .setTitle(`Server Information for ${server.name}`)
            .setDescription(`Server Made On: <t:${Math.floor(server.createdTimestamp/1000)}:F> (<t:${Math.floor(server.createdTimestamp/1000)}:R>)`)
            .addFields(
              { name: `ID`, value: server.id, inline: true },
              { name: `Owner ID`, value: server.owner.id, inline: true },
              { name: `Roles`, value: server.roles.cache.size, inline: true },
              { name: `Members`, value: server.memberCount, inline: true },
              { name: `Channels`, value: server.channels.cache.size, inline: true },
              { name: `Bans`, value: server.fetchBans().then(bans => {return bans.size}), inline: true }
            );
            interaction.followUp({ embeds: [embed], ephemeral: false });
            break;
      }

      cooldown.add(interaction.member.id);
      setTimeout(() => {
        cooldown.delete(interaction.member.id);
      }, 5000)
    }
  }
}