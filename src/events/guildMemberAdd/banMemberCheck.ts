import { GuildMember } from "discord.js";
import { KitsuneClient } from "../../types.js";
import { getConfig, toConsole } from "../../functions.js";
import { Temporal } from '@js-temporal/polyfill';

function replaceTemplates(str: string, replacers: Record<string, string>) {
  return str.replace(/\{\{\w+\}\}/g, (match: string) => {
    return replacers[match] || match;
  })
}

export async function run(client: KitsuneClient, guildMember: GuildMember) {
  const config = await getConfig(client, guildMember.guild.id);
  if (!config) {
    return;
  }

  const placeholders = {
    '{{guild_name}}': guildMember.guild.name,
    '{{guild_id}}': guildMember.guild.id,
    '{{until}}': '', // Will be replaced later
    '{{until_relative}}': '' // Will be replaced later
  } as Record<string, string>;

  const now = Temporal.Duration.from(new Date().toISOString());
  const createdAt = Temporal.Duration.from(guildMember.user.createdAt.toISOString());
  const kickTime = Temporal.Duration.from({ days: config.data.kickConfig.days || -1 })
  const banTime = Temporal.Duration.from({ days: config.data.banConfig.days || -1 });

  if (Temporal.Duration.compare(createdAt.add(banTime), now) > 1 && config.data.banConfig.days !== -1) {
    if (!guildMember.guild.members.me!.permissions.has("BanMembers")) {
      return;
    }
    if (guildMember.guild.members.me!.roles.highest.comparePositionTo(guildMember.roles.highest) <= 0) {
      return;
    }

    placeholders['{{until}}'] = String(Math.floor(createdAt.add(banTime).total('seconds')));
    placeholders['{{until_relative}}'] = `<t:${placeholders['{{until}}']}:R>`;
    const reason = replaceTemplates(config.data.banConfig.reason, placeholders);

    await guildMember.user.send(`Banned from ${guildMember.guild.name} temporarily: ${reason}`)
      .catch(() => null);    
    await guildMember.ban({
      reason,
      // Prune messages that we can in case Discord
      // replays or delays the join event
      deleteMessageSeconds: 24 * 60 * 60
    })
      .catch((reason) => toConsole(`Failed to ban ${guildMember.user.tag} (${guildMember.id}): ${reason}`, new Error().stack!, client));

    client.models.Bans.create({
      userId: guildMember.user.id,
      modId: client.user!.id,
      guildId: guildMember.guild.id,
      reason,
      expiry: new Date(banTime.total('milliseconds'))
    });
  } else if (Temporal.Duration.compare(createdAt.add(kickTime), now) < 0 && config.data.kickConfig.days !== -1) {
    if (!guildMember.guild.members.me!.permissions.has("KickMembers")) {
      return;
    }
    if (guildMember.guild.members.me!.roles.highest.comparePositionTo(guildMember.roles.highest) <= 0) {
      return;
    }

    placeholders['{{until}}'] = String(Math.floor(createdAt.add(kickTime).total('seconds')));
    placeholders['{{until_relative}}'] = `<t:${placeholders['{{until}}']}:R>`;
    const reason = replaceTemplates(config.data.kickConfig.reason, placeholders);

    await guildMember.user.send(`Kicked from ${guildMember.guild.name}: ${config.data.kickConfig.reason}`)
      .catch((reason) => toConsole(`Failed to send kick message to ${guildMember.user.tag} (${guildMember.id}): ${reason}`, new Error().stack!, client));
    await guildMember.kick(reason)
      .catch((reason) => toConsole(`Failed to kick ${guildMember.user.tag} (${guildMember.id}): ${reason}`, new Error().stack!, client));

    client.models.Kicks.create({
      userId: guildMember.user.id,
      modId: client.user!.id,
      guildId: guildMember.guild.id,
      reason
    });
  }
}