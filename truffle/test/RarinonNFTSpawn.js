const BN = require('bn.js')
const all = require('./header')

const { RarinonNFT, RarinonDAO, RarinonAuction, RarinonSpawn } = all.abi
const { advanceBlockAtTime } = all

describe('RarinonNFTSpawn', () => {
    let nft, dao, auction, spawn
    let accounts;
    let son_address, father_address

    const FATHER_PERIOD = 5;
    const SPAWN_PERIOD = 5;
    const TOKEN_URI = 'ipfs://some_token_uri#.*'

    it('getting addresses', async () => {
        accounts = await web3.eth.getAccounts()
        WINNER = accounts[5]
    })

    it('create nft', async () => {
        nft = await RarinonNFT.new("RarinonTest", "RNT")
    })

    it('create rarinon DAO', async () => {
        dao = await RarinonDAO.new(nft.address, 30, 2)
        father_address = dao.address
    })

    it('create rarinon Auction', async () => {
        auction = await RarinonAuction.new(nft.address, dao.address, 5)
        son_address = auction.address
    })

    it('Check creation (arguments)', async () => {
        try{
            await RarinonSpawn.new(all.zero_address, SPAWN_PERIOD, son_address, father_address, FATHER_PERIOD)
            throw "Zero token address allowed"
        }
        catch{}

        try{
            await RarinonSpawn.new(accounts[0], SPAWN_PERIOD, son_address, father_address, FATHER_PERIOD)
            throw "Non ERC721 token address allowed"
        }
        catch{}
        
        try{
            await RarinonSpawn.new(all.zero_address, 0, son_address, father_address, FATHER_PERIOD)
            throw "Spawn period < 1 allowed"
        }
        catch{}

        try{
            await RarinonSpawn.new(all.zero_address, SPAWN_PERIOD, all.zero_address, father_address, FATHER_PERIOD)
            throw "Zero son address allowed"
        }
        catch{}

        try{
            await RarinonSpawn.new(all.zero_address, SPAWN_PERIOD, son_address, all.zero_address, FATHER_PERIOD)
            throw "Zero father address allowed"
        }
        catch{}

        try{
            await RarinonSpawn.new(all.zero_address, SPAWN_PERIOD, son_address, father_address, 0)
            throw "Father period < 1 allowed"
        }
        catch{}        
    })

    it('create rarinon Spawn + event', async () => {
        spawn = await RarinonSpawn.new(nft.address, SPAWN_PERIOD, son_address, father_address, FATHER_PERIOD)
        let tx = await nft.transferOwnership(spawn.address)
        assert.equal(tx.logs[0].event, 'OwnershipTransferred')
        assert.equal(tx.logs[0].args.newOwner, spawn.address)
    })

    it('mint tokens directly restricted', async () => {
        try {
            await nft.mint(accounts[1], 'ipfs of token 1')
            throw 'Direct spawning allowed but rights already transferred.'
        } catch (ex) { }        
    })    

    it('spawn token 1', async () => {
        let tx = await spawn.invoke('TOKEN_URI')
        assert.equal(tx.logs[0].event, 'Deposit')
        assert.equal(tx.logs[0].args._invoker, accounts[0])
        assert.equal(tx.logs[0].args._id, 1)
        assert.equal(tx.logs[0].args._receiver, son_address)

        it('spawned token available', async () => {
            let uri = await nft.tokenURI(1)
            assert.equal(uri, TOKEN_URI)
        })
    
        it('spawned token belongs to son (by balance)', async () => {
            let balance = await nft.balanceOf(son_address)
            assert.equal(balance, 1)
        })
    })

    it('spawn token till SPAWN_PERIOD failed', async () => {
        try {
            await spawn.invoke('')
            throw 'Spawn ignore spawn period.'
        } catch (ex) { }
    })

    it('spawn after SPAWN_PERIOD allowed', async () => {
        await advanceBlockAtTime(SPAWN_PERIOD)
        await spawn.invoke('')
    })

    it('Recreate rarinon Spawn', async () => {
        nft = await RarinonNFT.new("RarinonTest", "RNT")
        
        dao = await RarinonDAO.new(nft.address, 30, 2)
        father_address = dao.address

        auction = await RarinonAuction.new(nft.address, dao.address, 5)
        son_address = auction.address

        spawn = await RarinonSpawn.new(nft.address, SPAWN_PERIOD, son_address, father_address, FATHER_PERIOD)
        await nft.transferOwnership(spawn.address)
    })

    it('spawn FATHER_PERIOD-1 to son', async () => {
        for (let i = 1; i < FATHER_PERIOD; i++){
            await spawn.invoke('')
            await advanceBlockAtTime(SPAWN_PERIOD)    
        }

        let son_balance = await nft.balanceOf(son_address)
        let father_balance = await nft.balanceOf(father_address)

        assert.equal(son_balance, FATHER_PERIOD - 1)
        assert.equal(father_balance, 0)
    })

    it('spawn FATHER_PERIOD to father', async () => {
        await spawn.invoke('')

        let son_balance = await nft.balanceOf(son_address)
        let father_balance = await nft.balanceOf(father_address)

        assert.equal(son_balance, FATHER_PERIOD - 1)
        assert.equal(father_balance, 1)
    })    

    it('again spawn FATHER_PERIOD-1 to son', async () => {
        for (let i = 1; i < FATHER_PERIOD; i++){
            await spawn.invoke('')
            await advanceBlockAtTime(SPAWN_PERIOD)    
        }

        let son_balance = await nft.balanceOf(son_address)
        let father_balance = await nft.balanceOf(father_address)

        assert.equal(son_balance, (FATHER_PERIOD - 1) * 2)
        assert.equal(father_balance, 1)
    })

    it('again spawn FATHER_PERIOD to father', async () => {
        await spawn.invoke('')

        let son_balance = await nft.balanceOf(son_address)
        let father_balance = await nft.balanceOf(father_address)

        assert.equal(son_balance, (FATHER_PERIOD - 1) * 2)
        assert.equal(father_balance, 2)
    })    

})