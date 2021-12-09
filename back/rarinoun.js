const fs = require('fs')
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

const bot = {
    address: '0xeebfb4a69478455127d1a5beceee03431b433785',
    privateKey: 'fa44be7baed063910161c6f7c60e8d539846db3044b02cb203cef34c09a28e5a'
}

var web3 = new Web3() //'http://localhost:10000');
let provider = new HDWalletProvider(bot.privateKey, 'https://ropsten.infura.io/v3/7f6d1c0c48cc4af7923ff507c64cd8e3')

function loadConf(filename) {
    if (!fs.existsSync(filename))
        return {}
    else
        return JSON.parse(fs.readFileSync('./data/nft.json').toString())
}

const nft = {
    abi() {
        return JSON.parse(fs.readFileSync('./contracts/NFT.abi').toString());
    },

    code() {
        return '0x' + fs.readFileSync('./contracts/NFT.bin').toString()
    },

    async init() {
        this.data = loadConf('./data/nft.json')
        console.log(this.data)
        if (!this.data.address) {
            await this.deploy()
        }

        this.contract = new web3.eth.Contract(this.abi(), this.data.address)
        this.contract.setProvider(provider)
    },

    async deploy() {
        let nft = new web3.eth.Contract(this.abi())
        nft.setProvider(provider)

        let res = await nft.deploy({data: code
            // ,arguments: [123, 'My String']
        }).send({
            from: bot.address,
            gas: '3000000'
        })

        this.data.address = res._address
        fs.writeFileSync('./data/nft.json', JSON.stringify(this.data))
    },

    async mint(ipfs_url) {
        return this.contract.methods.awardItem(bot.address, ipfs_url).send({
            from: bot.address,
            gas: '7000000'
        })
    },

    async urlById(id){
        return this.contract.methods.tokenURI(id).call({
            from: bot.address,
            gas: '7000000'
        })
    },

    async getAll(){
        let CurrentID = await this.contract.methods.CurrentID().call({
            from: bot.address,
            gas: '7000000'
        })

        let res = []
        for (let i = 1; i <= CurrentID; i++){
            let url = await this.contract.methods.tokenURI(i).call({
                from: bot.address,
                gas: '7000000'
            })
            res.push({index: i, url: url})
        }

        return res
    }
}

const dao = {
    async init() {

    },

    async deploy(nft_address) {

    }
}

const auction = {
    async init() {

    },

    async deploy_auction(nft_address, dao_address) {

    },

    async create_auction(nft_address){

    },

    async check_auction(){

    },

    async close_auction(){

    }
}


module.exports = {
    nft,
    dao,
    auction,

    async init() {
        await this.nft.init()
        await this.dao.init()
        await this.auction.init()

        return this
    }
}