const BN = require('bn.js')
const all = require('./header')

const { RarinonNFT, RarinonDAO, RarinonAuction, RarinonSpawn } = all.abi

describe('RarinonDAO', () => {
    let nft, dao
    let accounts;
    let MAIN_ACC;
    let keepers = [];

    const INITIAL_BALANCE = 100;
    let PROPOSAL1_ADR;
    const PROPOSAL1_BALANCE = 10;
    let PROPOSAL2_ADR;
    const PROPOSAL2_BALANCE = 100;
    const VOTE_PERIOD = 30; //sec
    const QUORUM = 2;

    it('getting addresses', async () => {
        accounts = await web3.eth.getAccounts()
        
        MAIN_ACC = accounts[0]
        PROPOSAL1_ADR = accounts[5]
        PROPOSAL2_ADR = accounts[6]
        keepers = [accounts[1], accounts[2]]
    })

    it('create nft', async () => {
        nft = await RarinonNFT.new("RarinonTest", "RNT")
    })

    it('Check input parameters', async () => {
        try {
            await RarinonDAO.new(all.zero_address, VOTE_PERIOD, QUORUM, keepers)
            throw "Zero address NFT alowed"
        } catch { }


        try {
            await await RarinonDAO.new(accounts[0], VOTE_PERIOD, QUORUM, keepers)
            throw 'Non IERC165 nft address allowed'
        }
        catch { }

        try {
            await RarinonDAO.new(nft.address, 0, 2, keepers)
            throw "VOTE_PERIOD < 1 allowed"
        } catch { }

        try {
            await RarinonDAO.new(nft.address, VOTE_PERIOD, 1, keepers)
            throw "QUORUM < 2 allowed"
        } catch { }
    })

    it('create rarinon DAO', async () => {
        dao = await RarinonDAO.new(nft.address, VOTE_PERIOD, QUORUM, keepers)
    })

    it('Checking keepers is ok', async () => {
        let is_keeper0 = await dao.is_keeper(accounts[0])

        let is_keeper1 = await dao.is_keeper(keepers[0])
        let is_keeper2 = await dao.is_keeper(keepers[1])

        assert.equal(is_keeper0, false, "Account 0 is not a keeper")
        assert.equal(is_keeper1, true, "Keeper 1 is not assigned")
        assert.equal(is_keeper2, true, "Keeper 2 is not assigned")
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

    it(`mint 1 token to MAIN_ACC`, async () => {
        await nft.mint(MAIN_ACC, 'Test token address 1')
    })

    it(`Can NOT create proposal with 1 NFT (create one for ${PROPOSAL1_BALANCE})`, async () => {
        try {
            await dao.addProposal(PROPOSAL1_ADR, PROPOSAL1_BALANCE, 'Test proposal 1', 'URL of tp1')
        } catch{}
    })

    it(`mint 1 more token to MAIN_ACC`, async () => {
        await nft.mint(MAIN_ACC, 'Test token address 1')
    })

    it(`Can create proposal with 2 NFT (create one for ${PROPOSAL1_BALANCE})`, async () => {
        let tx = await dao.addProposal(PROPOSAL1_ADR, PROPOSAL1_BALANCE, 'Test proposal 1', 'URL of tp1')
        assert.equal(tx.logs[0].event, 'Open')
        assert.equal(tx.logs[0].args.vote_id, 0)
        assert.equal(tx.logs[0].args.author, MAIN_ACC)

        let vote0 = await dao.history(0)
        assert.equal(vote0.account, PROPOSAL1_ADR)
        assert.equal(vote0.amount, PROPOSAL1_BALANCE)
    })

    it(`There is 1 proposal`, async () => {
        let count = await dao.historyCount()
        assert.equal(count, 1)
    })

    it(`Create another proposal (create one for ${PROPOSAL2_BALANCE})`, async () => {
        let tx = await dao.addProposal(PROPOSAL2_ADR, PROPOSAL2_BALANCE, 'Test proposal 1', 'URL of tp1')

        assert.equal(tx.logs[0].event, 'Open')
        assert.equal(tx.logs[0].args.vote_id, 1)
        assert.equal(tx.logs[0].args.author, MAIN_ACC)

        let vote0 = await dao.history(1)
        assert.equal(vote0.account, PROPOSAL2_ADR)
        assert.equal(vote0.amount, PROPOSAL2_BALANCE)
    })

    it(`There is 2 proposals`, async () => {
        let count = await dao.historyCount()
        assert.equal(count, 2)
    })

    it(`Info about 1st and 2nd proposals available`, async () => {
        let history0 = await dao.history(0)
        assert.equal(history0 != null, true)

        let history1 = await dao.history(1)
        assert.equal(history1 != null, true)
    })

    it(`Can NOT vote without NFT`, async () => {
        try {
            await dao.addProposal(PROPOSAL1_ADR, INITIAL_BALANCE * 2, 'Test proposal 1', 'URL of tp1', { from: accounts[1] })
            throw 'Anyone can vote.'
        }
        catch { }
    })

    it(`Can vote with NFT`, async () => {
        let tx = await dao.vote(0, true)

        assert.equal(tx.logs[0].event, 'Vote')
        assert.equal(tx.logs[0].args.vote_id, 0)
        assert.equal(tx.logs[0].args.voter, MAIN_ACC)
        assert.equal(tx.logs[0].args.yes, true)
    })

    it(`Can not vote twice`, async () => {
        try {
            await dao.vote(0, true)
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

        let tx = await dao.vote(0, true, { from: accounts[1] })

        assert.equal(tx.logs[0].event, 'Vote')
        assert.equal(tx.logs[0].args.vote_id, 0)
        assert.equal(tx.logs[0].args.voter, accounts[1])
        assert.equal(tx.logs[0].args.yes, true)

        assert.equal(tx.logs[1].event, 'Close')
        assert.equal(tx.logs[1].args.vote_id, 0)
        assert.equal(tx.logs[1].args.approved, true)

        let balanceAfter = new BN(await web3.eth.getBalance(acc))

        let diff = balanceAfter.sub(balance).toNumber()
        assert.equal(diff, history0.amount)
    })

    it(`Can NOT vote on closed proposal`, async () => {
        try {
            await dao.vote(0, true, { from: accounts[2] })
            await dao.vote(0, true, { from: accounts[3] })
            await dao.vote(0, true, { from: accounts[4] })
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

    it(`Can create proposal with 2 NFT (create one for ${PROPOSAL1_BALANCE})`, async () => {
        let tx = await dao.addProposal(PROPOSAL1_ADR, PROPOSAL1_BALANCE, 'Test proposal 1', 'URL of tp1')
        assert.equal(tx.logs[0].event, 'Open')
        assert.equal(tx.logs[0].args.vote_id, 2)
        assert.equal(tx.logs[0].args.author, MAIN_ACC)

        let vote = await dao.history(2)
        assert.equal(vote.account, PROPOSAL1_ADR)
        assert.equal(vote.amount, PROPOSAL1_BALANCE)
    })

    it(`Vote against 2 times to decline`, async () => {
        {
            let tx = await dao.vote(2, false)
            assert.equal(tx.logs[0].event, 'Vote')
            assert.equal(tx.logs[0].args.vote_id, 2)
            assert.equal(tx.logs[0].args.voter, MAIN_ACC)
            assert.equal(tx.logs[0].args.yes, false)  
        }

        {
            let tx = await dao.vote(2, false, { from: accounts[1]})
            assert.equal(tx.logs[0].event, 'Vote')
            assert.equal(tx.logs[0].args.vote_id, 2)
            assert.equal(tx.logs[0].args.voter, accounts[1])
            assert.equal(tx.logs[0].args.yes, false)

            assert.equal(tx.logs[1].event, 'Close')
            assert.equal(tx.logs[1].args.vote_id, 2)
            assert.equal(tx.logs[1].args.approved, false)    
        }
    })

    it(`Can create proposal with 2 NFT to be declined by keeper`, async () => {
        let tx = await dao.addProposal(PROPOSAL1_ADR, PROPOSAL1_BALANCE, 'Test proposal 1', 'URL of tp1')
        assert.equal(tx.logs[0].event, 'Open')
        assert.equal(tx.logs[0].args.vote_id, 3)
        assert.equal(tx.logs[0].args.author, MAIN_ACC)

        let vote = await dao.history(3)
        assert.equal(vote.account, PROPOSAL1_ADR)
        assert.equal(vote.amount, PROPOSAL1_BALANCE)
    })

    it(`Non keeper can NOT decline proposal`, async () => {
        try{
            await dao.decline(3)
            throw 'Anyone can decline proposal'
        }catch{}
    })


    it(`Keeper can decline proposal`, async () => {
        {
            let tx = await dao.decline(3, {from: keepers[0]})
            assert.equal(tx.logs[0].event, 'Close')
            assert.equal(tx.logs[0].args.vote_id, 3)
            assert.equal(tx.logs[0].args.approved, false)    
        }
    })

    it(`changing vote time`, async () => {
        let time = await dao.vote_period()
        await dao.set_vote_period(new BN(time).toNumber() + 10)
        let timeAfter = await dao.vote_period()
        assert.equal(new BN(timeAfter).sub(new BN(time)).toNumber(), 10)
    })

    it(`changing quorum`, async () => {
        let quorum = await dao.quorum()
        await dao.set_quorum(new BN(quorum).toNumber() + 10)
        let quorumAfter = await dao.quorum()
        assert.equal(new BN(quorumAfter).sub(new BN(quorum)).toNumber(), 10)
    })

})