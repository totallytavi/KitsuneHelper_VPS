import { SlashCommandBuilder } from '@discordjs/builders';
// eslint-disable-next-line no-unused-vars
import { Client, CommandInteraction, CommandInteractionOptionResolver, MessageButton } from 'discord.js';
import { interactionEmbed, awaitButtons } from '../functions.js';
import ms = require('ms');

module.exports = {
  name: 'ban',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banishes a user from the forest, preventing them from returning unless unbanned')
    .addUserOption((option) => {
      return option.setName('user').setDescription('The magician to be banished').setRequired(true);
    })
    .addStringOption((option) => {
      return option.setName('reason').setDescription('The reason for banishing the magician').setRequired(false);
    })
    .addNumberOption((option) => {
      return option
        .setName('purge')
        .setDescription('How many days before the banishment to purge messages')
        .setRequired(false)
        .addChoices(
          { name: 'none', value: 0 },
          { name: '1day', value: 1 },
          { name: '2days', value: 2 },
          { name: '3days', value: 3 },
          { name: '4days', value: 4 },
          { name: '5days', value: 5 },
          { name: '6days', value: 6 },
          { name: '7days', value: 7 }
        );
    })
    .addStringOption((option) => {
      return option
        .setName('duration')
        .setDescription('How long to ban the magician for (Examples: 1h, 30m, 1.5d)')
        .setRequired(false);
    }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
   */
  run: async (client: Client, interaction: CommandInteraction, options: CommandInteractionOptionResolver) => {
    const member = options.getUser('user', true);
    const reason = options.getString('reason') ?? 'No reason provided';
    const days = options.getNumber('days') ?? 0;
    let duration: string | number = options.getString('duration');
    // If the duration contains multiple times, add them together
    if (duration?.match(/(\d+[hmsd])/g)?.length > 1) {
      const times = duration.match(/(\d+[hmsd])/g);
      duration = 0;
      for (const time of times) {
        duration += ms(time);
      }
    }
    if (typeof duration !== 'number') duration = ms(duration);
    if (typeof duration === 'undefined') duration = new Date(0); // Not a duration

    if (!interaction.member.permissions.has('BAN_MEMBERS'))
      return interactionEmbed(3, '[ERR-UPRM]', 'Missing: `Ban Members`', interaction, client, true);
    if (!interaction.guild.members.me.permissions.has('BAN_MEMBERS'))
      return interactionEmbed(3, '[ERR-UPRM]', 'Missing: `Ban Members`', interaction, client, true);
    if (interaction.user.id === member.value)
      return interactionEmbed(3, '[ERR-ARGS]', "Sorry, you can't ban yourself!", interaction, client, true);
    if (member.member) {
      if (interaction.member.roles.highest.rawPosition <= member.member.roles.highest.rawPosition)
        return interactionEmbed(
          3,
          '[ERR-ARGS]',
          'That magician is equal to or higher than you. Make sure your highest role is above theirs',
          interaction,
          client,
          true
        );
      if (interaction.guild.members.me.roles.highest.rawPosition <= member.member.roles.highest.rawPosition)
        return interactionEmbed(
          3,
          '[ERR-ARGS]',
          'That magician is equal to or higher than me. Make sure my highest role is above theirs',
          interaction,
          client,
          true
        );
    }

    const confirmation = await awaitButtons(
      interaction,
      15,
      [
        new MessageButton({ customId: 'yes', label: 'Yes, I do want to ban this magician', style: 'DANGER' }),
        new MessageButton({ customId: 'no', label: 'No, I do not want to ban this user', style: 'SUCCESS' })
      ],
      'Are you sure you want to ban this magician?',
      true
    );
    if (confirmation.customId === 'yes') {
      await interaction.guild.bans.create(member, {
        days: days,
        reason: `${reason} (Moderator ID: ${interaction.user.id})`
      });
      await client.models.ModAction.create({
        active: true,
        guild: interaction.guild.id,
        target: member.value,
        executor: interaction.user.id,
        type: 'Ban',
        duration: duration,
        reason: reason
      });
      return interactionEmbed(
        1,
        `${member} was banned for \`${reason}\`. \`${days}\` day(s) of messages sent by that user will be wiped away with magic!`,
        '',
        interaction,
        client,
        false
      );
    } else {
      interaction.editReply({ content: ':x: Banishment cancelled, the magician remains in your forest!' });
    }
  }
};
