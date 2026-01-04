import { Client, CommandInteraction, CommandInteractionOptionResolver, MessageEmbed, SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
import { default as config } from "../config.json" with {"type": "json"};
import { interactionEmbed } from "../functions.js";
const { image_board } = config;

export const name = image_board.name;
export const data = new SlashCommandBuilder()
  .setName(image_board.name)
  .setDescription(`Queries an image from ${image_board.name} with the options provided`)
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
      .addChoices(
        { name: "1", value: 1 },
        { name: "2", value: 2 },
        { name: "3", value: 3 },
        { name: "4", value: 4 },
        { name: "5", value: 5 },
        { name: "6", value: 6 },
        { name: "7", value: 7 },
        { name: "8", value: 8 },
        { name: "9", value: 9 },
        { name: "10", value: 10 }
      );
  })
  .addBooleanOption(option => {
    return option
      .setName("safe_search")
      .setDescription("Restricts images shown to being safe (Default: false)")
      .setRequired(false);
  });
/**
 * @param {Client} client Client object
 * @param {CommandInteraction} interaction Interaction Object
 * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
 */
export async function run(client, interaction, options) {
  let tags = options.getString("tag").replace(/\(/g, "%28").replace(/\)/g, "%29");
  let skipped, passed = 0;
  if (tags.match(/[^1-6]\+/)) return interactionEmbed(2, "[ERR-ARGS]", "You cannot enter more than 1 tag!", interaction, client, true);

  const safe = !interaction.channel.nsfw || options.getBoolean("safe_search") ? true : false;
  const limit = options.getNumber("limit") ?? 10;
  if (safe) tags += "+rating:g";
  tags += "+random:" + limit;
  const params = new URLSearchParams();
  params.append("login", image_board["username"]);
  params.append("api_key", image_board["api_key"]);

  fetch(`https://${image_board["domain"]}/posts.json?tags=${tags}&${params.toString()}`, { headers: { "User-Agent": "KitsuneHelper/0 (+github.com/totallytavi/KitsuneHelper_VPS)" }, timeout: 5000 })
    .then(res => res.json())
    .then(json => {
      if (json.length === 0 || json.success === false) return interactionEmbed(3, "[ERR-EXPT]", json.length === 0 ? `\`${tags.split("+")[0]}\` doesn't exist on ${image_board["name"]}` : `Something went wrong when requesting data from ${image_board["name"]}. Please report this to the support server:\n>>> Success? ${json.success}\nMessage: ${json.message}\nResponse:\n${json}`, interaction, client, false);
      for (const post of json) {
        // Filters
        if (post.is_deleted || post.tag_string.split(" ").includes("loli")) {
          skipped++;
          continue;
        }
        if (safe && post.rating != "g") {
          skipped++;
          continue;
        }
        const image = post.large_file_url || post.file_url || post.preview_file_url;
        if (!/\.jpg|\.png|\.gif/.test(image)) {
          skipped++;
          continue;
        }

        // Custom title
        let artists, characters;
        artists = post.tag_string_artist.replace(/_/g, "\\_"); characters = post.tag_string_character.replace(/_/g, "\\_"); // Makes this embed friendly
        if (artists.split(" ").length > 1) {
          artists = `${artists.split(" ")[0]} and ${artists.split(" ").length - 1} others`;
        } else {
          artists = !artists ? "Unknown" : artists;
        }
        if (characters.split(" ").length > 1) {
          characters = `${characters.split(" ")[0]} and ${characters.split(" ").length - 1} others`;
        } else {
          characters = !characters ? "Original" : characters;
        }

        // Embed
        const embed = new MessageEmbed({
          title: `${characters} by ${artists}`,
          url: `https://${image_board["domain"]}/posts/${post.id}`,
          image: {
            url: post.large_file_url || post.file_url || post.preview_file_url
          },
          footer: {
            text: `ID: ${post.id} | Score: ${post.score} | Rating: ${post.rating}`
          }
        });

        interaction.followUp({ embeds: [embed] });
        passed++;
        if (skipped + passed === json.length) interaction.editReply({ content: `Skipped ${skipped} images` });
      }
    })
    .catch(e => {
      if (e.message.startsWith("network timeout"))
        interactionEmbed(3, "[ERR-EXPT]", `The request to ${image_board["name"]} timed out. Please try again later.`, interaction, client, false);

      else
        interactionEmbed(3, "[ERR-EXPT]", `Something went wrong when requesting data from ${image_board["name"]}. Please report this to the support server:\n>>> Error: FetchError: ${e.code} ${e.message.replace(image_board["username"], "usernameHidden").replace(image_board["api_key"], "api_keyHidden")}`, interaction, client, false);
    });
}
