const { Client, CommandInteraction, CommandInteractionOptionResolver, MessageEmbed } = require(`discord.js`);
const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { interactionToConsole, interactionEmbed } = require(`../functions.js`);
const fetch = require(`fetch`).fetchUrl;
const cooldown = new Set();

module.exports = {
  name: `danbooru`,
  data: new SlashCommandBuilder()
  .setName(`danbooru`)
  .setDescription(`Queries an image from Danbooru`)
  .addStringOption(option => {
    return option
    .setName(`tag1`)
    .setDescription(`What to search for (Put underscores instead of spaces)`)
    .setRequired(true)
  })
  .addStringOption(option => {
    return option
    .setName(`tag2`)
    .setDescription(`What to search for (Put underscores instead of spaces)`)
    .setRequired(false)
  })
  .addNumberOption(option => {
    return option
    .setName(`limit`)
    .setDescription(`How many images you want to search (Default: 10)`)
    .setRequired(false)
    .addChoices([
      [`1`, 1],
      [`2`, 2],
      [`3`, 3],
      [`4`, 4],
      [`5`, 5],
      [`6`, 6],
      [`7`, 7],
      [`8`, 8],
      [`9`, 9],
      [`10`, 10]
    ])
  })
  .addStringOption(option => {
    return option
    .setName(`rating`)
    .setDescription(`The rating of the posts (Default: Any)`)
    .setRequired(false)
    .addChoices([
      [`safe`,`safe`],
      [`questionable`,`questionable`],
      [`explicit`,`explicit`]
    ])
  }),
  /**
   * @param {Client} client Client object
   * @param {CommandInteraction} interaction Interaction Object
   * @param {CommandInteractionOptionResolver} options Array of InteractionCommand options
   */
  run: async (client, interaction, options) => {
    if(cooldown.has(interaction.member.id)) {
      return interactionEmbed(2, `[ERR-CLD]`, interaction, client, true);
    } else {
      let tag1 = options.getString(`tag1`);
      if(tag1.match(/[^1-6]\+/)) return interactionEmbed(3, `[ERR-ARGS]`, interaction, client, true);
      let tag2;
      if(options.getString(`tag2`) && options.getString(`tag2`).match(/[^1-6]\+/)) {
        tag1.concat("+", options.getString(`tag2`));
        tag2 = options.getString(`tag2`);
      }
      let limit = options.getNumber(`limit`) ?? 10;
      let rating = options.getString(`rating`) ?? `any`;
      switch(rating) {
        case `safe`:
          rating = `s`
          break
        case `questionable`:
          rating = `q`
          break
        case `explicit`:
          rating = `e`
          break
      }

      if(interaction.channel.nsfw === false) {
        interactionEmbed(4, `This channel is not set to NSFW. Therefore, the query will only search for SAFE posts. This may result in less or no images found`, interaction, client, false);
      }

      let url = "";
      if(interaction.channel.nsfw != true) {
        url = `https://danbooru.donmai.us/posts.json?tags=${tag1}&limit=${limit}&random=true&rating=s&api_key=o7YZcCmpiHPZXY6Nm8TDxhjZ&login=Coder_Tavi`;
      } else {
        url = `https://danbooru.donmai.us/posts.json?tags=${tag1}&limit=${limit}&random=true&rating=${rating}&api_key=o7YZcCmpiHPZXY6Nm8TDxhjZ&login=Coder_Tavi`;
      }
      console.log(url)

      fetch(url, function(_e, _m, body) {
        const json = JSON.parse(body);
        for (post of json) {
          if(post.tag_string_artist.split(" ").includes("banned")) continue; // Banned artists
          if(post.tag_string.split(" ").includes("loli")) continue; // Lolis
          const image = post.large_file_url || post.file_url || post.preview_file_url;
          if(!/\.jpg|\.png|\.gif/.test(image)) continue; // Bad urls
          if(post.rating != "s" && interaction.channel.nsfw != true) {
            client.channels.cache.get(`899115176635269190`).send({ content: `Danbooru has failed to filter an image during a \`rating=s\` request!`, embeds: [new MessageEmbed().setTitle(`ID: ${post.id}`).setDescription(`Request URL: ${url}`).setFooter(`Rating: ${post.rating}`)] });
            continue;
          }
          if(rating != `any` && post.rating != rating) {
            client.channels.cache.get(`899115176635269190`).send({ content: `Danbooru has failed to filter an image during a \`rating=${rating}_var\` request!`, embeds: [new MessageEmbed().setTitle(`ID: ${post.id}`).setDescription(`Request URL: ${url}`).setFooter(`Rating: ${post.rating}`)] });
            continue;
          }
          // The above is because Danbooru fails to filter by rating when I specify it in this code

          const embed = new MessageEmbed()
          .setAuthor("Artist(s): " + post.tag_string_artist)
          .setDescription(`ID: ${post.id} :-: Score: ${post.score}`)
          .setImage(image)
          .setFooter("Tags: " + post.tag_string.split(" ").join(", ") + " | Posted on")
          .setTimestamp(post.created_at)

          interaction.channel.send({ embeds: [embed], ephemeral: false });
        }
      });

      cooldown.add(interaction.user.id);
      setTimeout(() => {
        interaction.fetchReply()
        .then(m => m.delete({ timeout: 5000 }))
        .catch(e => Promise.reject(e));
        cooldown.delete(interaction.user.id);
      }, 5000);
    }
  }
}