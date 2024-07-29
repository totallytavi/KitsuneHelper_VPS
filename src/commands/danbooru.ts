const { SlashCommandBuilder } = require('@discordjs/builders');
// eslint-disable-next-line no-unused-vars
const { Client, CommandInteraction, CommandInteractionOptionResolver, MessageEmbed } = require('discord.js');
const { interactionEmbed } = require('../functions.js');
const config = require('../config.json');
const fetch = require('node-fetch');

module.exports = {
  name: 'danbooru',
  data: new SlashCommandBuilder()
    .setName('danbooru')
    .setDescription('Queries an image from Danbooru with the options provided')
    .addStringOption((option) => {
      return option.setName('tag').setDescription('What to search for').setRequired(true);
    })
    .addNumberOption((option) => {
      return option
        .setName('limit')
        .setDescription('How many images you want to search (Default: 10)')
        .setRequired(false);
    })
    .addBooleanOption((option) => {
      return option
        .setName('safe_search')
        .setDescription('Restricts images shown to being SFW (Default: Strict)')
        .setChoices(
          {
            name: 'Safe',
            value: 'safe'
          },
          {
            name: 'Sensitive',
            value: 'sensitive'
          },
          {
            name: 'Strict',
            value: 'strict'
          }
        )
        .setRequired(false);
    }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
   */
  run: async (client, interaction, options) => {
    let tags = options.getString('tag').replace(/\(/g, '%28').replace(/\)/g, '%29');
    let skipped,
      passed = 0;
    if (tags.match(/[^1-6]\+/))
      return interactionEmbed(2, '[ERR-ARGS]', 'You cannot enter more than 1 tag!', interaction, client, true);

    const safe = !interaction.channel.nsfw || options.getBoolean('safe_search') ? true : false;
    const limit = options.getNumber('limit') ?? 10;
    if (safe) tags += '+rating:g';
    tags += '+random:' + limit;
    const params = new URLSearchParams();
    params.append('login', config.danbooru['username']);
    params.append('api_key', config.danbooru['api_key']);

    fetch(`https://danbooru.donmai.us/posts.json?tags=${tags}&${params.toString()}`, {
      headers: { 'User-Agent': 'KitsuneHelper/0 (+github.com/Coder-Tavi/KitsuneHelper_VPS)' },
      timeout: 5000
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.length === 0 || json.success === false)
          return interactionEmbed(
            3,
            '[ERR-EXPT]',
            json.length === 0
              ? `\`${tags.split('+')[0]}\` doesn't exist on Danbooru`
              : `Something went wrong when requesting data from Danbooru. Please report this to the support server:\n>>> Success? ${json.success}\nMessage: ${json.message}\nResponse:\n${json}`,
            interaction,
            client,
            false
          );
        for (const post of json) {
          // Filters
          if (post.is_deleted || post.tag_string.split(' ').includes('loli')) {
            skipped += 1;
            continue;
          }
          if (safe && post.rating != 'g') {
            skipped += 1;
            continue;
          }
          const image = post.large_file_url || post.file_url || post.preview_file_url;
          if (!/\.jpg|\.png|\.gif/.test(image)) {
            skipped += 1;
            continue;
          }

          // Custom title
          let artists, characters;
          artists = post.tag_string_artist.replace(/_/g, '\\_');
          characters = post.tag_string_character.replace(/_/g, '\\_'); // Makes this embed friendly
          if (artists.split(' ').length > 1) {
            artists = `${artists.split(' ')[0]} and ${artists.split(' ').length - 1} others`;
          } else {
            artists = !artists ? 'Unknown' : artists;
          }
          if (characters.split(' ').length > 1) {
            characters = `${characters.split(' ')[0]} and ${characters.split(' ').length - 1} others`;
          } else {
            characters = !characters ? 'Original' : characters;
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
          passed += 1;
          if (skipped + passed === json.length) interaction.editReply({ content: `Skipped ${skipped} images` });
        }
      })
      .catch((e) => {
        if (e.message.startsWith('network timeout'))
          interactionEmbed(
            3,
            '[ERR-EXPT]',
            'The request to Danbooru timed out. Please try again later.',
            interaction,
            client,
            false
          );
        else
          interactionEmbed(
            3,
            '[ERR-EXPT]',
            `Something went wrong when requesting data from Danbooru. Please report this to the support server:\n>>> Error: FetchError: ${
              e.code
            } ${e.message
              .replace(config.danbooru['username'], 'usernameHidden')
              .replace(config.danbooru['api_key'], 'api_keyHidden')}`,
            interaction,
            client,
            false
          );
      });
  }
};
