const fs = require('fs')
var Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

const TokenHelper = require('./TokenHelper');

const conf = require('./conf')
let provider = new HDWalletProvider(conf.web3_pk, conf.web3_url)
var web3 = new Web3(provider);

let tokenHelper = new TokenHelper()


let instances = fs.existsSync('./data/instances.json') ? require('./data/instances.json') : {}

/**
 * Создать или загрузить контракт.
 * @param {*} json_file Путь к файлу контракта (build от truffle)
 * @param {*} arguments Аргументы создания контракта.
 * @returns 
 */
async function instance(json_file, arguments) {
    let json = require(json_file)
    if (instances[json_file]) {
        console.log(`Address ${instances[json_file].address} found for ${json_file}`)
        return new web3.eth.Contract(json.abi, instances[json_file].address) //'0xC21F049fa08858839b9E6646970469E23A3575c7')
    }

    let contract = new web3.eth.Contract(json.abi)

    try {
        let res = await contract
            .deploy({ data: json.bytecode, arguments })
            .send({
                from: conf.web3_address,
                gas: '3000000'
            })

        console.log(`Address ${res._address} created for ${json_file}`)

        instances[json_file] = { ...instances[json_file], address: res._address }
        fs.writeFileSync('./data/instances.json', JSON.stringify(instances, null, '\t'))
        // console.log(res._address)
        return res
    }
    catch (ex) {
        console.log(ex)
    }
}

let nft, dao, auction

async function start() {
    nft = await instance('./contracts/RarinonNFT.json', ['Name', 'SYMBOL'])
    // 10 minute
    dao = await instance('./contracts/RarinonDAO.json', [nft._address, 10 * 60, 8])
    auction = await instance('./contracts/RarinonAuction.json', [nft._address, dao._address, 10 * 60])
    // 1 day
    // dao = await instance('./contracts/RarinonDAO.json', [nft._address, 60 * 60 * 24, 8])
    // auction = await instance('./contracts/RarinonAuction.json', [nft._address, dao._address, 60 * 60 * 24])

    let bal = await nft.methods.balanceOf(nft._address).call()
    console.log(bal)

    // loop_auction_worker()
    // loop_dao_worker()

    // console.log(auction._address)
    // await nft.methods.mint(auction._address, 'none uri').send({from: conf.web3_address})

    // let curid = await nft.methods.CurrentID().call()    
    // let url = await nft.methods.tokenURI(curid).call()    
    // console.log(curid, url)
}

start()

// Постоянно запрашиваем можно ли закрыть аукцион.
async function loop_auction_worker() {

    try {
        // Если можно закрываем.
        let need_create_round = false

        let count = await auction.methods.historyCount().call()
        console.log('loop_auction_worker count', count)

        if (count == 0) {
            need_create_round = true;
        }
        else {
            let can = await auction.methods.canClose().call()
            if (can) {
                console.log('Can close round. Closing round...')
                await auction.methods.close().send({ from: conf.web3_address })
                need_create_round = true;
            }
            else {
                console.log('Can not close round. Check last round...')
                let last = await auction.methods.history(count - 1).call()
                if (last.closed){
                    console.log('Last round closed. Creating new.')
                    need_create_round = true
                }
            }
        }

        if (need_create_round) {
            console.log('Creating new round...')
            let token_url = await tokenHelper.crteate_token()
            console.log('token_url', token_url)
            await nft.methods.mint(auction._address, token_url).send({ from: conf.web3_address })
            let id = await nft.methods.CurrentID().call()
            await auction.methods.createRound(id).send({ from: conf.web3_address })
            await auction.methods.createBid().send({ from: conf.web3_address, value: web3.utils.toWei('0.01', 'ether') })
            console.log('Created')
        }
        
    }
    catch (ex) {
        console.log('loop_auction_worker error', ex)
    }

    setTimeout(loop_auction_worker, 30000);
}



// Постоянно запрашиваем можно ли закрыть аукцион.
let proposals = []

async function loop_dao_worker() {

    try {
        // Получим все запросы в дао.


        // Если можно закрываем.
        let count = await dao.methods.historyCount().call()
        console.log('loop_dao_worker count', count)

        for (let i = proposals.length; i < count; i++){
            let proposal = await dao.methods.history(i).call()
            proposals.push(proposal)
        }        

        for (let i = 0; i < proposals.length; i++){
            if (!proposals[i].closed){
                let can = await dao.methods.canClose(i)
                if (can){
                    console.log(`Closing proposal ${i}...`)
                    await dao.methods.close(i).send({ from: conf.web3_address })
                    proposals[i].closed = true
                    console.log(`Closed`)
                }
            }
        }
    }
    catch (ex) {
        console.log('loop_dao_worker error', ex)
    }

    setTimeout(loop_dao_worker, 5000);
}

// Получаем все запросы денег.
// Проверяем какие открыты
