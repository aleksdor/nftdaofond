const fs = require('fs')
const path = require('path')

/**
 * Класс для создания или восстановления экземпляра контракта.
 */
module.exports = class {
    /**
     * @param {string} web3 Настроенный экземпляр Web3
     * @param {string} cache_file Путь к afqфайлу с конфигом.
     */
    constructor(web3, cache_file) {
        this.cache_file = cache_file
        this.web3 = web3
    }

    /**
     * Создать или загрузить контракт.
     * @param {*} truffle_file Путь к файлу контракта (build от truffle)
     * @param {*} args Аргументы создания контракта.
     * @returns 
     */
    async instance(abi_file, args) {
        let name = path.basename(abi_file, '.json')
        let instances = fs.existsSync(this.cache_file) ? require(this.cache_file) : {}

        let truffle = require(abi_file)
        if (instances[name]) {
            console.log(`Address ${instances[name]} found for ${abi_file}`)
            return new this.web3.eth.Contract(truffle.abi, instances[name])
        }

        console.log(`Address not found for ${name}. Will deploy.`)

        let contract = new this.web3.eth.Contract(truffle.abi)
        try {
            let res = await contract
                .deploy({ data: truffle.bytecode, arguments: args })
                .send(
                {
                    from: this.web3.defaultAccount,
                    gas: '3000000'
                })

            console.log(`Address ${res._address} created for ${name}`)

            instances[name] = res._address
            fs.writeFileSync(this.cache_file, JSON.stringify(instances, null, '\t'))
            console.log(`Address ${res._address} for ${name} saved.`)
            return res
        }
        catch (ex) {
            console.log(ex)
        }
    }
}