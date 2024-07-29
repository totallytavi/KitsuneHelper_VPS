import { EmbedBuilder } from 'discord.js';
import * as config from './config.json';
var ResponseError;
(function (ResponseError) {
    ResponseError["[SQL-ERR]"] = "An error has occurred while trying to execute a MySQL query";
    ResponseError["[ERR-CLD]"] = "You are on cooldown!";
    ResponseError["[ERR-UPRM]"] = "You do not have the proper permissions to execute this command";
    ResponseError["[ERR-BPRM]"] = "I do not have the proper permissions to execute this command";
    ResponseError["[ERR-ARGS]"] = "You have not supplied the correct parameters. Please check again";
    ResponseError["[ERR-UNK]"] = "I can't tell why an issue spawned. Please report this to a developer";
    ResponseError["[ERR-EXPT]"] = "An unexpected error occurred";
    ResponseError["[ERR-MISS]"] = "I cannot find the information in the system";
    ResponseError["[WARN-NODM]"] = "Sorry, but all slash commands only work in a server, not DMs";
    ResponseError["[WARN-CMD]"] = "The requested slash command was not found";
    ResponseError["[INFO-DEV]"] = "This command is in development. This should not be expected to work";
})(ResponseError || (ResponseError = {}));
var ResponseType;
(function (ResponseType) {
    ResponseType[ResponseType["Success"] = 0] = "Success";
    ResponseType[ResponseType["Warning"] = 1] = "Warning";
    ResponseType[ResponseType["Error"] = 2] = "Error";
    ResponseType[ResponseType["Information"] = 3] = "Information";
})(ResponseType || (ResponseType = {}));
/**
 * @description Sends a message to the console
 * @param {string} message The message to send to the console
 * @param {Error} source Error from the line of code that called this function
 * @param {Client} client Logged-in Client to send the message
 * @returns {Promise<void>}
 * @example toConsole('Hello, World!', new Error(), client);
 * @example toConsole('Published a ban', new Error(), client);
 */
function toConsole(message, source, client) {
    if (!client.channels.cache)
        return Promise.reject('Client is not logged in');
    if (!client.channels.cache.get(config.bot['errorChannel']))
        return Promise.reject('Error channel could not be found by the bot');
    // Fetch logging channel
    const channel = client.channels.cache.get(config.bot.console);
    if (typeof channel === 'undefined' || !channel.isTextBased())
        return Promise.reject('Channel is not a text channel');
    if (!source.stack)
        return Promise.reject('Source is not an Error object');
    const stackSource = /(?:[A-Za-z0-9._]+:[0-9]+:[0-9]+)/g.exec(source.stack)[0];
    channel.send({
        embeds: [
            new EmbedBuilder({
                title: 'Message to Console',
                color: 0xff0000,
                description: message,
                footer: {
                    text: stackSource
                },
                timestamp: new Date()
            })
        ]
    });
    return Promise.resolve();
}
/**
 * @async
 * @description Replies with an {@link EmbedBuilder} to the {@link Interaction} provided
 * @example responseEmbed(1, 'Removed ${removed} roles', '', interaction)
 * @example responseEmbed(3, ResponseType.Error, ResponseError.UserPermission, interaction)
 */
async function responseEmbed(type, content, interaction, expected) {
    const image = interaction.user.avatarURL({ size: 4096 }) === null
        ? 'https://cdn.discordapp.com/embed/avatars/5.png'
        : interaction.user.avatarURL({ size: 4096 });
    const embed = new EmbedBuilder()
        .setTitle('Spell Cast!')
        .setAuthor({ name: interaction.user.username, iconURL: image })
        .setDescription(!expected ? content : `${ResponseError[content]}\n> ${expected}`)
        .setTimestamp();
    switch (type) {
        case ResponseType.Success:
            embed.setColor(0x5865f2); // Blurple
            break;
        case ResponseType.Warning:
            embed.setColor(0xff8800); // Orange
            break;
        case ResponseType.Error:
            embed.setColor(0xed4245); // Red
            break;
        case ResponseType.Information:
            embed.setColor(0x5865f2); // Blurple
            break;
    }
    return interaction.editReply({ embeds: [embed] });
}
/** @description Sends components and returns the first one clicked */
async function awaitComponents(interaction, items, timeout, content) {
    return interaction
        .editReply({ content, components: items })
        .then((m) => m.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id, time: timeout }));
}
/** @description Sends components and returns the collector */
async function sendComponents(interaction, items, timeout, content) {
    return interaction
        .editReply({ content, components: items })
        .then((m) => m.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id, time: timeout }));
}
/**
 * @param {string} time String in format (Xy) where X is a number and y is a unit of time (y, d, h, m, s)
 * @example parseTime("1d") => 86400
 * @example parseTime("1h2m3s") => 3723
 * @returns {number} Number of seconds or {@link NaN} if any errors
 */
function parseTime(time) {
    let duration = 0;
    const regex = /[1-9]{1,3}[ydhms]/g;
    time = time
        .toLowerCase()
        .split('')
        .filter((v) => v === v.trim())
        .join('');
    if (!regex.test(time))
        return NaN;
    const matches = time.match(regex);
    if (!matches)
        return NaN;
    for (const match of matches) {
        const num = parseInt(match.replace(/[a-z]/g, ''));
        const unit = match.replace(/[0-9]/g, '');
        switch (unit) {
            case 'y':
                duration += num * 31536000;
                break;
            case 'd':
                duration += num * 86400;
                break;
            case 'h':
                duration += num * 3600;
                break;
            case 'm':
                duration += num * 60;
                break;
            case 's':
                duration += num;
                break;
        }
    }
    return duration;
}
export { ResponseError, ResponseType, awaitComponents, parseTime, responseEmbed, toConsole };
