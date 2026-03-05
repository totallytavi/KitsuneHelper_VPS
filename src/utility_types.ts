import { ApplicationCommandOptionAllowedChannelTypes, RestOrArray } from "@discordjs/builders";
import { ChannelType } from "discord-api-types/v9";

export const TextBasedChannels = [
  ChannelType.AnnouncementThread,
  ChannelType.GuildAnnouncement,
  ChannelType.GuildText,
  ChannelType.PrivateThread,
  ChannelType.PublicThread
] as RestOrArray<ApplicationCommandOptionAllowedChannelTypes>;
export const VoiceBasedChannels = [
  ChannelType.GuildStageVoice,
  ChannelType.GuildVoice
] as RestOrArray<ApplicationCommandOptionAllowedChannelTypes>;