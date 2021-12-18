const fs = require('fs')

var Web3 = require('web3');

const HDWalletProvider = require('@truffle/hdwallet-provider');

const conf = require('./conf')
let provider = new HDWalletProvider(conf.web3_pk, conf.web3_url)
var web3 = new Web3(provider);

// let abi = JSON.parse(fs.readFileSync('./contracts/GameItemNFT.abi').toString());
// let code = '0x' + fs.readFileSync('./contracts/GameItemNFT.bin').toString()

async function star222() {
    let tx = {
        // from: A1,
        // gasPrice: "20000000000",
        gas: "1000000",
        // to: A2,
        to: null, //'0x0000000000000000000000000000000000000000',
        // to: '0',
        // value: "0x00",
        // nonce: "0x00",
        data: code
    }

    // let tx2 = await web3.eth.signTransaction(tx, privateKey)
    let signedTx = await web3.eth.accounts.signTransaction(tx, A1PK);
    // console.log(signedTx)

    const sentTx = await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
    console.log('sentTx', sentTx)

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms)); 
    }

    let hash = '0x02a2a4b42e1278c7d1a2b50fcde53bf51957f4a16954ff03dc8bdd9198c97a27'

    await sleep(3000)
    for (let i = 0; i < 30; i++) {
        // let ttx = await web3.eth.getTransaction(sentTx.transactionHash);
        // console.log(ttx)    

        let receipt = await web3.eth.getTransactionReceipt(sentTx.transactionHash);
        console.log(receipt.contractAddress)

        // let balance = await web3.eth.getBalance(A1)
        // console.log(balance)

        // balance = await web3.eth.getBalance(A2)
        // console.log(balance)
        await sleep(3000)
    }

    let balance = await web3.eth.getBalance(A3)
    console.log(balance)


    // return

    // //.send({ from: A1, gas: 1000000 });
    // // Transaction has entered to geth memory pool
    // console.log("Your contract is being deployed in transaction at http://testnet.etherscan.io/tx/" + contract.transactionHash);

    // // console.log(contract)

    // while (true) {
    //     let receipt = web3.eth.getTransactionReceipt(contract.transactionHash);
    //     if (receipt && receipt.contractAddress) {
    //         console.log("Your contract has been deployed at http://testnet.etherscan.io/address/" + receipt.contractAddress);
    //         console.log("Note that it might take 30 - 90 sceonds for the block to propagate befor it's visible in etherscan.io");
    //         break;
    //     }
    //     console.log("Waiting a mined block to include your contract... currently in block " + web3.eth.blockNumber);
    //     await sleep(4000);
    // }


    // let balance = await web3.eth.getBalance(A1)
    // console.log(balance)
}


let NFT_address = '0x45A6D8C7d6eC1C0E2392a57b802e3eADD019ca47'

function init() {

}

async function deploy_contract(){
    let nft = new web3.eth.Contract(abi)
    nft.setProvider(provider)

    let res = await nft.deploy({data: code
        // ,arguments: [123, 'My String']
    }).send({
        from: A3,
        gas: '3000000'
    })

    console.log(res._address)

}


async function mint_token(adr) {
    let nft = new web3.eth.Contract(abi, adr)
    nft.setProvider(provider)
    let res = await nft.methods.awardItem(A3, 'some string').send({
        from: A3,
        gas: '7000000'
    })
    console.log(res)
}

async function token_id(){
    let nft = new web3.eth.Contract(abi, adr)
    nft.setProvider(provider)
    let res = await nft.methods.CurrentID().call({
        from: A3,
        gas: '7000000'
    })
    console.log(res)
}

async function token_url(id){
    let nft = new web3.eth.Contract(abi, adr)
    nft.setProvider(provider)
    let res = await nft.methods.tokenURI(id).call({
        from: A3,
        gas: '7000000'
    })
    console.log(res)
}

function start_auction(token, end_at) {

}


// deploy_contract()
let adr = '0xD28fB2207FaC9Da7839Cd5DED51558d4754a8eA2'



// const Rarinon = require('./rarinoun')
const cm = require('./services/candy_machine')
const TraitSet = require('./models/trait_set')
const IPFS = require('./services/ipfs_infura')

let ipfs = new IPFS('', '')


async function start(){
    // - Развернем конракт NFT токена


    
    // Создаем контракт если его еще не было или загружаем из кеша.
    // let ru = await Rarinon.init() 

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
    let ret = await ipfs.upload_file(await img.getBufferAsync("image/png"))    
    // - Получим нормальную ссылку на картинку в ipfs
    let image_url = ipfs.get_link(ret.path)

    // console.log(image_url)

    // - Парсим json шаблон токена.
    let tpl = trs.template()
    let json = cm.build_nft_json(tpl, ts1, image_url)

    // - Льем json в IPFS
    let ret_json = await ipfs.upload_file(JSON.stringify(json))
    // - Получим нормальную ссылку на картинку в ipfs
    let json_url = ipfs.get_link(ret_json.path)

    console.log(json_url)

    // - Минтим токен боту и подставляем ему созданный адрес ipfs.
    // await ru.nft.mint(json_url)

    // - Получаем все токены контракта для дебага.
    // let all = await ru.nft.getAll()

    // - Выводим их.
    // console.log(all)
}

start()
