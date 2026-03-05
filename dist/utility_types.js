import { ChannelType } from "discord-api-types/v9";
export const TextBasedChannels = [
    ChannelType.AnnouncementThread,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildText,
    ChannelType.PrivateThread,
    ChannelType.PublicThread
];
export const VoiceBasedChannels = [
    ChannelType.GuildStageVoice,
    ChannelType.GuildVoice
];
