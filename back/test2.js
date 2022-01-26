var Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

const conf = require('./conf')
let provider = new HDWalletProvider(conf.web3_pk, conf.web3_url)

var web3 = new Web3(provider);

async function start(){    
    let json = require('./contracts/RarinonDAO.json')
    let dao = new web3.eth.Contract(json.abi, '0x3DF183f7aB77D4Ca6A3274Cc0A21a9B081DB81Af')

    let res = await dao.methods.addProposal('0x3161eb3b7b9d760c542f11275d369b7be4d96eff', '0x1', '', '').call()

    console.log(res)
    
}

start();

