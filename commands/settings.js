const { Client, CommandInteraction, CommandInteractionOptionResolver, MessageActionRow, MessageSelectMenu, MessageEmbed } = require(`discord.js`);
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { interactionToConsole, interactionEmbed } = require(`../functions.js`);
const fs = require(`fs`)
const cooldown = new Set();

module.exports = {
  name: `settings`,
  data: new SlashCommandBuilder()
  .setName(`settings`)
  .setDescription(`Changes your server's settings`)
  .addStringOption(option => {
    return option
    .setName(`option`)
    .setDescription(`The setting to change`)
    .addChoices([
      [`ban_using_ksoft`, `banWithKSoft`]
    ])
    .setRequired(true)
  }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options3
   */
  run: async (client, interaction, options) => {
    if(cooldown.has(interaction.member.id)) {
      return interactionEmbed(2, `[ERR-CLD]`, interaction, client);
    } else {
      if(!interaction.member.permissions.has(`MANAGE_SERVER`)) return interactionEmbed(2, `[ERR-UPRM]`, interaction, client);
      const setting = options.getString(`option`);
      const menu = new MessageActionRow();
      const embed = new MessageEmbed();

      switch(setting) {
        case `banWithKSoft`:
          menu
          .addComponents(
            new MessageSelectMenu()
            .setCustomId(`banWithKSoft`)
            .setPlaceholder(`Select an option`)
            .addOptions([
              { label: `True`, description: `Ban users on join if they are on the KSoft.Si banlist`, value: `true` },
              { label: `False`, description: `Do not ban users on join if they are on the KSoft.Si banlist`, value: `false` }
            ])
          );
          embed
          .setTitle(`Settings`)
          .setDescription(`Changing "banWithKSoft" setting`)
          .setFooter(`This will expire in 10 seconds`)
          interaction.editReply({ embeds: [embed], components: [menu] });
      }

      const filter = i => {
        i.deferUpdate();
        return i.user.id === interaction.user.id;
      };
      const message = await interaction.fetchReply();
      let config = {};
      message.awaitMessageComponent({ filter, componentType: `SELECT_MENU`, time: 10000 })
      .then(async (i) => {
        let value = i.values[0];
        switch(i.customId) {
          case "banWithKSoft":
            config [i.guild.id] = {
              banWithKSoft: value
            };
            fs.writeFileSync("guild_settings.json", JSON.stringify(config, null, 4));
            i.deleteReply();
            interaction.editReply({ content: `Updated!`, embeds: [embed.setDescription(`Set "${i.customId}" to \`${value}\``)], components: [] })
            break
        }
      })
      .catch((err) => {
        interaction.editReply({ content: `Cancelled`, embeds: [embed.setDescription(`No changes were made to "${message.components[0].components[0].customId}"\n> Issue:- ${err}`)], components: [] });
      });
      

      cooldown.add(interaction.user.id);
      setTimeout(() => {
        cooldown.delete(interaction.user.id);
      }, 10000);
    }
  }
}
