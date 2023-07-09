const { EmbedBuilder } = require('discord.js');

class Anime {
    id = null
    data = null
    defaultTitle = null
    nsfw = false
    constructor(id) {
        this.id = id
    }
    async init() {
        const res = await fetch(`https://api.jikan.moe/v4/anime/${this.id}`)
        if (!res.ok) {
            throw new Error('Invalid MAL anime\'s ID')
        }
        const data = await res.json()
        this.data = data.data
        this.__setDefaultTitle()
    }
    __setDefaultTitle() {
        var res = this.data.titles[0].title
        const genres = new Set(this.getSimplifiedGenres())
        if (genres.has('Ecchi')) {
            res = '(Ecchi) ' + res
        }
        if (genres.has('Hentai') || genres.has('Erotica')) {
            this.nsfw = true
        }
        this.defaultTitle = res + ` (MAL ${this.id})`
    }
    getSimplifiedGenres() {
        if (!this.data) {
            throw new Error('Anime data is not initialized')
        }
        const simplifiedGenres = []
        for (const i of this.data.genres) {
            simplifiedGenres.push(i.name)
        }
        for (const i of this.data.explicit_genres) {
            simplifiedGenres.push(i.name)
        }
        return simplifiedGenres
    }
    getGenreTagsSnowflake(availableTags) {
        const keys = {}
        for (const i of availableTags) {
            keys[i.name] = i
        }
        const simplifiedGenres = this.getSimplifiedGenres()
        const res = []
        for (const i of simplifiedGenres) {
            if (i == 'Hentai' || i == 'Erotica') {
                continue
            }
            res.push(keys[i].id)
        }
        return res
    }
    getDiscordEmbed() {
        if (!this.data) {
            throw new Error('Anime data is not initialized')
        }
        return new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(this.data.titles[0].title)
            .setURL(this.data.url)
            .setThumbnail(this.data.images.jpg.image_url)
            .addFields(
                { name: 'Score', value: String(this.data.score), inline: true },
                { name: 'Ranked', value: `#${String(this.data.rank)}`, inline: true },
                { name: 'Popularity', value: `#${String(this.data.popularity)}`, inline: true },
                {
                    name: 'Alternative titles',
                    value: (() => {
                        var res = []
                        for (const i of this.data.titles) {
                            res.push(i.title)
                        }
                        res = res.unshift()
                        return res.join(', ')
                    })()
                },
                { name: 'Genres', value: String(this.getSimplifiedGenres().join(', ')) },
                { name: 'Episodes', value: String(this.data.episodes) },
                { name: 'Status', value: String(this.data.status) },
                { name: 'Aired', value: String(this.data.aired.string) },
                {
                    name: 'Producers',
                    value: (() => {
                        var res = []
                        for (const i of this.data.producers) {
                            res.push(i.name)
                        }
                        return res.join(', ')
                    })()
                },
                {
                    name: 'Studios',
                    value: (() => {
                        var res = []
                        for (const i of this.data.studios) {
                            res.push(i.name)
                        }
                        return res.join(', ')
                    })()
                },
                { name: 'Source', value: String(this.data.source) },
                { name: 'Duration', value: String(this.data.duration) },
                { name: 'Rating', value: String(this.data.rating) },
            )
    }
}

module.exports = Anime