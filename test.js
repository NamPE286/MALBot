const Anime = require('./classes/Anime')

const anime = new Anime(41930)

async function main(){
    await anime.init()
    console.log(anime.getDiscordEmbed())
}
main()