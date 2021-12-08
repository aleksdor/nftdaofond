// const Migra = artifacts.require("Migrations")

const RarinonNFT = artifacts.require("RarinonNFT")
const RarinonDAO = artifacts.require("RarinonDAO")
const RarinonAuction = artifacts.require("RarinonAuction")

describe('RarinonNFT', () => {
    let nft, dao
    let accounts;

    // let mi = new Migra()
    it('getting addresses', async () => {
        accounts = await web3.eth.getAccounts()
        // console.log(accounts)
    })

    it('Create contract nft', async () => {
        nft = await RarinonNFT.new("RarinonTest", "RNT")
    })

    it('Owner Mint 1 token to A1', async () => {
        await nft.mint(accounts[1], 'ipfs of token 1')
    })

    it('token 1 uri is correct', async () => {
        let uri = await nft.tokenURI(1)
        assert.equal(uri, 'ipfs of token 1')
    })


    it('Not owner fail Mint 1 token to A1', async () => {
        try{
            await nft.mint(accounts[1], 'ipfs of token 1', {from: accounts[1]})
            throw 'Anyone can emit tokens.'
        }
        catch {}
    })


    it('Mint 1 token to A1', async () => {
        await nft.mint(accounts[1], 'ipfs of token 1')
    })

    it('A1 has 2 tokens', async () => {
        let balance = await nft.balanceOf(accounts[1])
        assert.equal( balance, 2, 'Balance is ok' );
    })

    it('Transfer 1 token from A1 to A2', async () => {
        await nft.transferFrom(accounts[1], accounts[2], 1, {from: accounts[1]})
    })

    it('A1 has 1 token', async () => {
        let balance = await nft.balanceOf(accounts[1])
        assert.equal( balance, 1, 'Balance is ok' );
    })

    it('A2 has 1 token', async () => {
        let balance = await nft.balanceOf(accounts[2])
        assert.equal( balance, 1, 'Balance is ok' );
    })

    it('Mint 1 toke to A2', async () => {
        await nft.mint(accounts[2], 'ipfs of token 1')
    })

    it('A2 has 2 tokens', async () => {
        let balance = await nft.balanceOf(accounts[2])
        assert.equal( balance, 2, 'Balance is ok' );
    })

    it('A2 failed burn token of A1', async () => {
        try{
            await nft.burn(2, {from: address[2]})
            throw 'Anyone can emit tokens.'
        }
        catch {}
    })

    it('A1 burned own token', async () => {
        await nft.burn(2, {from: accounts[1]})
    })

    it('A1 has 0 tokens', async () => {
        let balance = await nft.balanceOf(accounts[1])
        assert.equal( balance, 0, 'Balance is ok' );
    })
})


describe('RarinonDAO', () => {
    let nft, dao
    let accounts;

    const INITIAL_BALANCE = 100;
    const PROPOSAL1_BALANCE = 10;
    const PROPOSAL2_BALANCE = 100;

    it('getting addresses', async () => {
        accounts = await web3.eth.getAccounts()
    })

    it('create nft', async () => {
        nft = await RarinonNFT.new("RarinonTest", "RNT")
    })

    it('create rarinon DAO', async () => {
        dao = await RarinonDAO.new(nft.address, 30, 2)
    })

    it('transfer some money to dao', async () => {
        await dao.send(INITIAL_BALANCE, {from: accounts[0]});
    })

    it(`dao balance ${INITIAL_BALANCE}`, async () => {
        let balance = await web3.eth.getBalance(dao.address)
        assert.equal( balance, INITIAL_BALANCE, 'Balance is ok' );
    })

    it(`create proposal 1 for ${PROPOSAL1_BALANCE}`, async () => {
        
   
    })


   

})


describe('RarinonAuction', () => {
    let nft, dao, auction
    let accounts;

    // let mi = new Migra()
    it('getting addresses', async () => {
        auction = RarinonAuction.new(nft.address)
    })
})