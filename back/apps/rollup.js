const fs = require('fs')

/**
 * Класс для создания или восстановления экземпляра контракта.
 */
module.exports = class {
    /**
     * @param {string} domain Догмен работы (test, prod, dev, rinkebyX)
     * @param {string} data_dir Путь к папке с конфигами.
     * @param {string} web3 Настроенный экземпляр Web3
     */
    constructor(domain, data_dir, web3) {
        this.domain = domain
        this.data_dir = data_dir
        this.web3 = web3
    }

    /**
     * Создать или загрузить контракт.
     * @param {*} truffle_file Путь к файлу контракта (build от truffle)
     * @param {*} args Аргументы создания контракта.
     * @returns 
     */
    async instance(abi_file, args) {
        let file_path = `${this.data_dir}/${this.domain}.json`

        let instances = fs.existsSync(file_path) ? require(file_path) : {}

        let truffle = require(abi_file)
        if (instances[abi_file]) {
            console.log(`Address ${instances[abi_file].address} found for ${abi_file}`)
            return new this.web3.eth.Contract(truffle.abi, instances[abi_file].address)
        }

        console.log(`Address not found for ${abi_file}. Will deploy.`)

        let contract = new this.web3.eth.Contract(truffle.abi)
        try {
            let res = await contract
                .deploy({ data: truffle.bytecode, arguments: args })
                .send(
                {
                    from: this.web3.defaultAccount,
                    gas: '3000000'
                })

            console.log(`Address ${res._address} created for ${abi_file}`)

            instances[abi_file] = { ...instances[abi_file], address: res._address }
            fs.writeFileSync(file_path, JSON.stringify(instances, null, '\t'))
            console.log(`Address ${res._address} for ${abi_file} saved.`)
            return res
        }
        catch (ex) {
            console.log(ex)
        }
    }
}