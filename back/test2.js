var Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

const conf = require('./conf')
let provider = new HDWalletProvider(conf.web3_pk, conf.web3_url)

var web3 = new Web3(provider);

async function add_proposal_test(){    
    let json = require('./contracts/RarinonDAO.json')
    let dao = new web3.eth.Contract(json.abi, '0x3DF183f7aB77D4Ca6A3274Cc0A21a9B081DB81Af')

    let res = await dao.methods.addProposal('0x3161eb3b7b9d760c542f11275d369b7be4d96eff', '0x1', '', '').call()

    console.log(res)
    
}

async function check_dao_test(){    
    let json = require('./contracts/RarinonDAO.json')
    let dao = new web3.eth.Contract(json.abi, '0xAD3392d05F5822064974FE1494D8D3aa4ADc0A30')

    let count = await dao.methods.historyCount().call()
    console.log('loop_dao_worker count', count)

    let quorum = await dao.methods.quorum().call()
    console.log('quorum', quorum)


    // let proposals = []
    // for (let i = proposals.length; i < count; i++){
    //     let proposal = await dao.methods.history(i).call()
    //     proposals.push(proposal)

    //     let aa = await dao.methods.canClose(i).call()
    //     console.log(`${i}: ${aa}`)


    // }        
try{
    let ans = await dao.methods.canClose(14).call()
    console.log(ans)

    ans = await dao.methods.canClose(15).call()
    console.log(ans)

    ans = await dao.methods.canClose(16).call()
    console.log(ans)


    let quorum2 = await dao.methods.close(16).send({from: conf.web3_address})
    console.log('quorum', quorum2)
}
catch(ex){
    console.log(ex)
}


    // console.log(proposals)

    // let res = await dao.methods. addProposal('0x3161eb3b7b9d760c542f11275d369b7be4d96eff', '0x1', '', '').call()

    // console.log(res)
    
}


check_dao_test();

