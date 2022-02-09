const { SlashCommandBuilder } = require("@discordjs/builders");
// eslint-disable-next-line no-unused-vars
const { Client, CommandInteraction, CommandInteractionOptionResolver, MessageEmbed } = require("discord.js");
const { interactionEmbed } = require("../functions.js");
const config = require("../config.json");
const fetch = require("node-fetch");

module.exports = {
  name: "danbooru",
  data: new SlashCommandBuilder()
    .setName("danbooru")
    .setDescription("Queries an image from Danbooru with the options provided")
    .addStringOption(option => {
      return option
        .setName("tag")
        .setDescription("What to search for")
        .setRequired(true);
    })
    .addNumberOption(option => {
      return option
        .setName("limit")
        .setDescription("How many images you want to search (Default: 10)")
        .setRequired(false)
        .addChoices([
          ["1", 1],
          ["2", 2],
          ["3", 3],
          ["4", 4],
          ["5", 5],
          ["6", 6],
          ["7", 7],
          ["8", 8],
          ["9", 9],
          ["10", 10]
        ]);
    })
    .addBooleanOption(option => {
      return option
        .setName("safe_search")
        .setDescription("Restricts images shown to being safe (Default: false)")
        .setRequired(false);
    }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
   */
  run: async (client, interaction, options) => {
    let tags = options.getString("tag").replace(/\(/g, "%28").replace(/\)/g, "%29");
    if(tags.match(/[^1-6]\+/)) return interactionEmbed(2, "[ERR-ARGS]", "Arg: tag :-: Expected 1 tag, got multiple tags", interaction, client, true);

    const safe = options.getBoolean("safe_search") ? true : false;
    const limit = options.getNumber("limit") ?? 10;
    if(options.getBoolean("safe_search")) tags += "+rating:s+random:" + limit;
    tags += "+random:" + limit;
    const params = new URLSearchParams();
    params.append("login", config.danbooru["username"]);
    params.append("api_key", config.danbooru["api_key"]);

    fetch(`https://danbooru.donmai.us/posts.json?tags=${tags}&${params.toString()}`, { timeout: 5000 })
      .then(res => res.json())
      .then(json => {
        if(json.length === 0 || json.success === false) return interactionEmbed(3, "[ERR-EXPT]", `Something went wrong when requesting data from Danbooru. Please report this to the support server:\n>>> Success? ${json.success}\nMessage: ${json.message}\nResponse:\n ${json.length === 0 ? "len = 0 (You searched for a tag that doesn't exist)" : json}`, interaction, client, false);
        for(const post of json) {
          // Filters
          if(post.is_deleted || post.tag_string.includes("loli")) continue;
          if((!interaction.channel.nsfw && post.rating != "s") || (safe && post.rating != "s")) continue;
          const image = post.large_file_url || post.file_url || post.preview_file_url;
          if(!/\.jpg|\.png|\.gif/.test(image)) continue;

          // Custom title
          let artists, characters;
          artists = post.tag_string_artist.replace(/_/g, "\\_"); characters = post.tag_string_character.replace(/_/g, "\\_"); // Makes this embed friendly
          if(artists.split(" ").length > 1) {
            artists = `${artists.split(" ")[0]} and ${artists.split(" ").length - 1} others`;
          } else {
            artists = !artists ? "Unknown" : artists;
          }
          if(characters.split(" ").length > 1) {
            characters = `${characters.split(" ")[0]} and ${characters.split(" ").length - 1} others`;
          } else {
            characters = !characters ? "Original" : characters;
          }

          // Embed
          const embed = new MessageEmbed({
            title: `${characters} by ${artists}`,
            url: `https://danbooru.donmai.us/posts/${post.id}`,
            image: {
              url: post.large_file_url || post.file_url || post.preview_file_url
            },
            footer: {
              text: `ID: ${post.id} | Score: ${post.score} | Rating: ${post.rating}`
            }
          });

          interaction.followUp({ embeds: [embed] });
        }
      })
      .catch(e => {
        interactionEmbed(3, "[ERR-EXPT]", `Something went wrong when requesting data from Danbooru. Please report this to the support server:\n>>> Error: FetchError: ${e.code} ${e.message.replace(config.danbooru["username"], "usernameHidden").replace(config.danbooru["api_key"], "api_keyHidden")}`, interaction, client, false);
      });
  }
};