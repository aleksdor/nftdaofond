const fs = require('fs')
var Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Rollup = require('./apps/rollup')
const TokenHelper = require('./TokenHelper');

const WD_Auction = require('./apps/wd.auction')
const WD_Dao = require('./apps/wd.dao')

const runner_lib = require('./libs/runner')

const conf = require('./conf')

// monkey patch for events through HDWalletProvider
const wsProvider = new Web3.providers.WebsocketProvider(conf.web3_url)
HDWalletProvider.prototype.on = wsProvider.on.bind(wsProvider)
let provider = new HDWalletProvider(conf.web3_pk, wsProvider)

var web3 = new Web3(provider);
// var web3 = new Web3(conf.web3_url);
web3.defaultAccount = conf.web3_address

let tokenHelper = new TokenHelper()
let nft, dao, auction

let wd_auction, wd_dao

async function start() {
    await web3.eth.getBalance(conf.web3_address, "latest").then(r => console.log(`Bot balance is: ${web3.utils.fromWei(r)}`))

    let rollup = new Rollup(web3, __dirname + '/data/ropsten.test.json')

    nft = await rollup.instance(__dirname + '/contracts/RarinonNFT.json', [conf.defs.nft.name, conf.defs.nft.symbol])
    dao = await rollup.instance(__dirname + '/contracts/RarinonDAO.json', [nft._address, conf.defs.dao.vote_period, conf.defs.dao.quorum, conf.defs.dao.keepers])
    auction = await rollup.instance(__dirname + '/contracts/RarinonAuction.json', [nft._address, dao._address, conf.defs.auction.round_time, conf.defs.auction.father, conf.defs.auction.father_period ])
    // Transfer control of Nft to Auction
    try { await nft.methods.transferOwnership(auction._address).send({from: web3.defaultAccount}) } catch{}

    wd_auction = new WD_Auction(auction, tokenHelper, web3)
    wd_auction.start()

    wd_dao = new WD_Dao(dao, web3)    
    wd_dao.start()
}

start()