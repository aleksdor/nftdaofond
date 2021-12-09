/**
 * Класс для загрузки файлов на ipfs infura.
 */
module.exports = class {
    constructor(project, key) {
        this.project = project
        this.key = key
    }

    /**
     * Залить файл в ipfs infura.
     * @param { * } buf Заливаемые данные
     * @returns 
     */
    async upload_file(buf) {
        const clicli = require('ipfs-http-client')
        let cli = clicli.create('https://ipfs.infura.io:5001')

        return cli.add(buf)

        // curl - X POST - F file = @myfile\
        // -u "PROJECT_ID:PROJECT_SECRET" \
        // "https://ipfs.infura.io:5001/api/v0/add"
    }

    get_link(hash) {
        return `https://ipfs.infura.io:5001/api/v0/cat?arg=${hash}`
    }
}