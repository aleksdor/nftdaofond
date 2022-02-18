const BN = require('bn.js')
const all = require('./header')

const { RarinonNFT, RarinonDAO, RarinonAuction, RarinonSpawn } = all.abi

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
        await dao.send(INITIAL_BALANCE, { from: accounts[0] });
    })

    it(`dao balance ${INITIAL_BALANCE}`, async () => {
        let balance = await web3.eth.getBalance(dao.address)
        assert.equal(balance, INITIAL_BALANCE, 'Balance is ok');
    })

    it(`Сan NOT create proposal without nft`, async () => {
        try {
            await dao.addProposal(accounts[5], PROPOSAL1_BALANCE, 'Test proposal 1', 'URL of tp1')
            throw 'Anyone can emit tokens.'
        }
        catch { }
    })

    it(`Can NOT create proposal for more than treasure`, async () => {
        try {
            await dao.addProposal(accounts[5], INITIAL_BALANCE * 2, 'Test proposal 1', 'URL of tp1')
            throw 'Anyone can emit tokens.'
        }
        catch { }
    })

    it(`mint 1 token to user`, async () => {
        await nft.mint(accounts[0], 'Test token address')
    })

    it(`Can create proposal with NFT (create one for ${PROPOSAL1_BALANCE})`, async () => {
        await dao.addProposal(accounts[5], PROPOSAL1_BALANCE, 'Test proposal 1', 'URL of tp1')
    })

    it(`There is 1 proposal`, async () => {
        let count = await dao.historyCount()
        assert.equal(count, 1)
    })

    it(`Create another proposal (create one for ${PROPOSAL2_BALANCE})`, async () => {
        await dao.addProposal(accounts[5], PROPOSAL2_BALANCE, 'Test proposal 1', 'URL of tp1')
    })

    it(`There is 2 proposals`, async () => {
        let count = await dao.historyCount()
        assert.equal(count, 2)
    })

    it(`Info about 1st and 2nd available`, async () => {
        let history0 = await dao.history(0)
        assert.equal(history0 != null, true)

        let history1 = await dao.history(1)
        assert.equal(history1 != null, true)
    })

    it(`Can NOT vote without NFT`, async () => {
        try {
            await dao.addProposal(accounts[5], INITIAL_BALANCE * 2, 'Test proposal 1', 'URL of tp1', { from: accounts[1] })
            throw 'Anyone can vote.'
        }
        catch { }
    })

    it(`Can vote with NFT`, async () => {
        await dao.voteYes(0)
    })

    it(`Can not vote twice`, async () => {
        try {
            await dao.voteYes(0)
            throw 'Can vote twice.'
        }
        catch { }
    })

    it(`Proposal 0 have 1 vote yes, 0 votes no`, async () => {
        let history0 = await dao.history(0)
        assert.equal(history0.nyes, 1)
        assert.equal(history0.nno, 0)
    })

    it(`mint some tokens to vote more`, async () => {
        await nft.mint(accounts[1], 'Test token address')
        await nft.mint(accounts[2], 'Test token address')
        await nft.mint(accounts[3], 'Test token address')
        await nft.mint(accounts[4], 'Test token address')
    })

    it(`vote more to get quorum and autoclose. Check money by the way`, async () => {
        let history0 = await dao.history(0)
        let acc = history0.account;
        let balance = new BN(await web3.eth.getBalance(acc))

        await dao.voteYes(0, { from: accounts[1] })

        let balanceAfter = new BN(await web3.eth.getBalance(acc))

        let diff = balanceAfter.sub(balance).toNumber()
        assert.equal(diff, history0.amount)
    })

    it(`Can NOT vote on closed proposal`, async () => {
        try {
            await dao.voteYes(0, { from: accounts[2] })
            await dao.voteYes(0, { from: accounts[3] })
            await dao.voteYes(0, { from: accounts[4] })
            throw 'Can vote twice.'
        }
        catch { }
    })

    it(`Can NOT close autoclosed proposal`, async () => {
        let can = await dao.canClose(0)
        assert.equal(can, false)
    })

    it(`can not close twice`, async () => {
        try {
            await dao.close(0)
            throw 'Can vote twice.'
        }
        catch { }
    })

    it(`changing round time`, async () => {
        let time = await dao.round_sec()
        await dao.set_round_sec(new BN(time).toNumber() + 10)
        let timeAfter = await dao.round_sec()
        assert.equal(new BN(timeAfter).sub(new BN(time)).toNumber(), 10)
    })

    it(`changing quorum`, async () => {
        let quorum = await dao.quorum()
        await dao.set_quorum(new BN(quorum).toNumber() + 10)
        let quorumAfter = await dao.quorum()
        assert.equal(new BN(quorumAfter).sub(new BN(quorum)).toNumber(), 10)
    })

})