import { GuildBan } from "discord.js";
import { KitsuneClient } from "../../types.js";
import { toConsole } from "../../functions.js";

export async function run(client: KitsuneClient, guildBan: GuildBan) {
  const ban = await client.models.Bans.findOne({
    where: {
      guildId: guildBan.guild.id,
      userId: guildBan.user.id
    }
  });

  if (!ban) {
    return;
  }
  await ban.destroy()
    .catch((reason) => toConsole(`Failed to remove ban on guildBanRemove: ${reason}`, new Error().stack!, client));
}