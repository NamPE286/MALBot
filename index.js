require('dotenv').config()
const { Client, GatewayIntentBits, ChannelType, channelLink } = require('discord.js');
const Anime = require('./classes/Anime');
const Manga = require('./classes/Manga');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

function getID(link) {
    const pos = link.indexOf('anime/') != -1 ? link.indexOf('anime/') : link.indexOf('manga/')
    link = link.replace(link.substring(0, pos + 6), '')

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

    var item;

    if(message.content.indexOf('anime/') != -1) {
        item = new Anime(getID(message.content))
    }
    else {
        item = new Manga(getID(message.content))
    }
    
    await item.init()

    if (item.nsfw === true) {
        await thread.delete()
        return
    }

    await thread.setName(item.defaultTitle)
    await thread.setAppliedTags(item.getGenreTagsSnowflake(thread.parent.availableTags))

    thread.send({ embeds: [item.getDiscordEmbed()] })
})

client.login(process.env.DISCORD_TOKEN)
