const BN = require('bn.js')
const all = require('./header')

const { RarinonNFT, RarinonDAO, RarinonAuction, RarinonSpawn } = all.abi

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
        try {
            await nft.mint(accounts[1], 'ipfs of token 1', { from: accounts[1] })
            throw 'Anyone can emit tokens.'
        }
        catch { }
    })

    it('Mint 1 token to A1', async () => {
        await nft.mint(accounts[1], 'ipfs of token 1')
    })

    it('A1 has 2 tokens', async () => {
        let balance = await nft.balanceOf(accounts[1])
        assert.equal(balance, 2, 'Balance is ok');
    })

    it('Transfer 1 token from A1 to A2', async () => {
        await nft.transferFrom(accounts[1], accounts[2], 1, { from: accounts[1] })
    })

    it('A1 has 1 token', async () => {
        let balance = await nft.balanceOf(accounts[1])
        assert.equal(balance, 1, 'Balance is ok');
    })

    it('A2 has 1 token', async () => {
        let balance = await nft.balanceOf(accounts[2])
        assert.equal(balance, 1, 'Balance is ok');
    })

    it('Mint 1 toke to A2', async () => {
        await nft.mint(accounts[2], 'ipfs of token 1')
    })

    it('A2 has 2 tokens', async () => {
        let balance = await nft.balanceOf(accounts[2])
        assert.equal(balance, 2, 'Balance is ok');
    })

    it('A2 failed burn token of A1', async () => {
        try {
            await nft.burn(2, { from: address[2] })
            throw 'Anyone can emit tokens.'
        }
        catch { }
    })

    it('A1 burned own token', async () => {
        await nft.burn(2, { from: accounts[1] })
    })

    it('A1 has 0 tokens', async () => {
        let balance = await nft.balanceOf(accounts[1])
        assert.equal(balance, 0, 'Balance is ok');
    })
})