// const Rarinon = require('./rarinoun')
const cm = require('./services/candy_machine')
const TraitSet = require('./models/trait_set')
const IPFS = require('./services/ipfs_infura')

module.exports = class {
    constructor(ipfs_id, ipfs_key) {
        this.ipfs = new IPFS(ipfs_id || '', ipfs_key || '')
    }

    async crteate_token() {
        // --- Готовим данные для токена
        // - Читаем папку слоев и генерируем по именам карту черт и читаем шаблон json-файла токена.
        let trs = TraitSet.fromDir('./data/sprites/Blume_png/')

        // - Создаем случайный набор черт
        // let ts1 = TraitSet.clean_traits(trs.get_random_trs())
        let ts1 = trs.get_random_trs()

        // - Генерируем по ним картинку токена (в памяти)
        let img = await cm.build_nft_image(ts1, trs.dir)
        // console.log(img)

        // - Льем картинку в IPFS (из памяти)
        let ret = await this.ipfs.upload_file(await img.getBufferAsync("image/png"))
        // - Получим нормальную ссылку на картинку в ipfs
        let image_url = this.ipfs.get_link(ret.path)

        // console.log(image_url)

        // - Парсим json шаблон токена.
        let tpl = trs.template()
        let json = cm.build_nft_json(tpl, ts1, image_url) 

        // - Льем json в IPFS
        let ret_json = await this.ipfs.upload_file(JSON.stringify(json))
        // - Получим нормальную ссылку на json в ipfs
        let json_url = this.ipfs.get_link(ret_json.path)

        return json_url
    }
}
