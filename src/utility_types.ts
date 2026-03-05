import { ApplicationCommandOptionAllowedChannelTypes, ChannelType, RestOrArray } from 'discord.js';

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