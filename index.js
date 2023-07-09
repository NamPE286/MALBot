require('dotenv').config()
const { Client, GatewayIntentBits, ChannelType, channelLink } = require('discord.js');
const Anime = require('./classes/Anime');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

function getID(link) {
    link = link.replace(link.substring(0, link.indexOf('anime/') + 6), '')
    return link.split('/')[0]
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('threadCreate', async (thread) => {
    if (thread.parent.type !== ChannelType.GuildForum) {
        return
    }

    if (thread.parent.id != process.env.CHANNEL_ID) {
        return
    }

    const message = await thread.fetchStarterMessage()

    if (message.content === 'set this as anime recommendation forum') {
        console.log('ok')
        await thread.parent.setAvailableTags(require('./allMALTags.json'))
        await thread.delete()
        return
    }

    const anime = new Anime(getID(message.content))
    await anime.init()

    if (anime.nsfw === true) {
        await thread.delete()
        return
    }

    await thread.setName(anime.defaultTitle)
    await thread.setAppliedTags(anime.getGenreTagsSnowflake(thread.parent.availableTags))

    thread.send({ embeds: [anime.getDiscordEmbed()] })
})

client.login(process.env.DISCORD_TOKEN)
