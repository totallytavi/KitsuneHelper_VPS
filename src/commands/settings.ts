import { stripIndents } from 'common-tags';
import { ChatInputCommandInteraction, CommandInteractionOptionResolver, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { getConfig, interactionEmbed, toConsole } from "../functions.js";
import { KitsuneClient } from "../types.js";

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('View or change the bot\'s settings.')
  .addSubcommand((subcommand) => 
    subcommand
      .setName('view')
      .setDescription('View the current settings.')
  )
  .addSubcommand((subcommand) => 
    subcommand
      .setName('change')
      .setDescription('Change a setting.')
      .addNumberOption((option) =>
        option
          .setName('min_kick_age')
          .setDescription('The minimum age (in days) of an account to be kicked (-1 to disable kicking)')
      )
      .addNumberOption((option) =>
        option
          .setName('min_ban_age')
          .setDescription('The minimum age (in days) of an account to be banned (-1 to disable banning)')
      )
      .addStringOption((option) =>
        option
          .setName('kick_reason')
          .setDescription('The reason for kicking accounts that are too young')
      )
      .addStringOption((option) =>
        option
          .setName('ban_reason')
          .setDescription('The reason for banning accounts that are too young')
      )
  )
  .setContexts(InteractionContextType.Guild)
  .setDefaultMemberPermissions('ManageGuild');
export const execute = async (client: KitsuneClient, interaction: ChatInputCommandInteraction<'cached'>, options: CommandInteractionOptionResolver) => {
  const config = await getConfig(client, interaction.guild.id);
  
  // If we see this, something has gone terribly wrong since
  // 0 will act as a fallback config and should always be
  // present!
  if (!config) {
    return interactionEmbed(3, 'Configuration fetch error', 'Something went wrong when fetching the configuration values', interaction, client, false);
  }

  if (interaction.options.getSubcommand() === 'view') {
    const guildConfig = config.data;

    interaction.editReply({
      content: stripIndents`
      ## Current Settings
      **Account Age Management**
      > Kick
      > - Enabled: ${guildConfig.kickConfig.days >= 0}
      > - Kick Accounts Younger Than: ${guildConfig.kickConfig.days} days
      > - Reason: ${guildConfig.kickConfig.reason.replaceAll(/`/g, '\\`')}
      > -# .
      > Ban
      > - Enabled: ${guildConfig.banConfig.days >= 0}
      > - Ban Accounts Under Than: ${guildConfig.banConfig.days} days
      > - Reason: ${guildConfig.banConfig.reason.replaceAll(/`/g, '\\`')}
      `
    });
    return;
  }

  // const defaultConfig = ;
  const props = {
    banConfig: {
      days: options.getNumber('min_ban_age') || config.data.banConfig.days,
      reason: options.getString('ban_reason') || config.data.banConfig.reason
    },
    kickConfig: {
      days: options.getNumber('min_kick_age') || config.data.kickConfig.days,
      reason: options.getString('kick_reason') || config.data.kickConfig.reason
    }
  }
  
  config.data = props;
  // Sequelize has a hard time detecting key changes
  config.changed('data');
  try {
    await config.save();
    interactionEmbed(1, "Settings Saved", "Your settings have been saved", interaction, client, false);
  } catch(err: any) {
    toConsole(`Failed to save ${interaction.guildId} guild settings: ${err.message} ${err.stack}`, new Error().stack!, client);
    interactionEmbed(3, "Failed to Save Settings", "An error occurred while updating the database entry", interaction, client, false);
  }
}