// const {
//     BN,           // Big Number support
//     constants,    // Common constants, like the zero address and largest integers
//     expectEvent,  // Assertions for emitted events
//     expectRevert, // Assertions for transactions that should fail
//   } = require('@openzeppelin/test-helpers');

const BN = require('bn.js')
const { time } = require("@openzeppelin/test-helpers");

const all = require('./header')


const { RarinonNFT, RarinonDAO, RarinonAuction, RarinonSpawn } = all.abi

describe('RarinonAuction', () => {
    let nft, dao, auction
    let accounts;
    let FATHER_ADDRESS

    let WINNER;
    const BID = 10;
    const WINNER_BID = 50;
    const ROUND_TIME = 5; // round time in seconds

    const FATHER_PERIOD = 5; // Each n-th token to father
    const TOKEN_URI = 'ipfs://some_token_uri#.*'

    it('getting addresses', async () => {
        accounts = await web3.eth.getAccounts()
        WINNER = accounts[5]
        FATHER_ADDRESS = accounts[6]
    })

    it('create nft', async () => {
        nft = await RarinonNFT.new("RarinonTest", "RNT")
    })

    it('create rarinon DAO', async () => {
        dao = await RarinonDAO.new(nft.address, 30, 2)
    })

    it('Check creation arguments', async () => {
        try {
            await RarinonAuction.new(all.zero_address, dao.address, ROUND_TIME, FATHER_ADDRESS, FATHER_PERIOD)
            throw 'Zero nft address allowed'
        }
        catch{}

        try {
            await RarinonAuction.new(accounts[0], dao.address, ROUND_TIME, FATHER_ADDRESS, FATHER_PERIOD)
            throw 'Non IERC165 nft address allowed'
        }
        catch{}

        try {
            await RarinonAuction.new(nft.address, all.zero_address, ROUND_TIME, FATHER_ADDRESS, FATHER_PERIOD)
            throw 'Zero dao address allowed'
        }
        catch{}

        try {
            await RarinonAuction.new(nft.address, dao.address, 0, FATHER_ADDRESS, FATHER_PERIOD)
            throw 'Round time < 1 allowed'
        }
        catch{}

        try{
            await RarinonAuction.new(nft.address, dao.address, ROUND_TIME, all.zero_address, FATHER_PERIOD)
            throw "Zero father address allowed"
        }
        catch{}

        try{
            await RarinonAuction.new(nft.address, dao.address, ROUND_TIME, FATHER_ADDRESS, 0)
            throw "Father period < 1 allowed"
        }
        catch{}         
    })

    it('create rarinon Auction', async () => {
        auction = await RarinonAuction.new(nft.address, dao.address, ROUND_TIME, FATHER_ADDRESS, FATHER_PERIOD)
        let tx = await nft.transferOwnership(auction.address)
        assert.equal(tx.logs[0].event, 'OwnershipTransferred')
        assert.equal(tx.logs[0].args.newOwner, auction.address)
    })

    it('mint tokens directly restricted', async () => {
        try {
            await nft.mint(accounts[0], TOKEN_URI)
            throw 'Direct spawning allowed but rights already transferred.'
        } catch (ex) { }        
    })     

    it('Start auction', async () => {
        let tx = await auction.createRound(TOKEN_URI)
        assert.equal(tx.logs[0].event, 'Open', "Events not mined")

        let historyCount = await auction.historyCount()
        let round = await auction.history(historyCount - 1);

        assert.equal(historyCount, 1, "History count incorrect")
        assert.equal(round.tokenId, 1, "Token index in round incorrect")
        assert.equal(round.closed, false, "Created round already closed")
        assert.equal(tx.logs[0].args.round, 0)

        it('spawned token available', async () => {
            let uri = await nft.tokenURI(1)
            assert.equal(uri, TOKEN_URI)
        })
    
        it('spawned token belongs to auction (by balance)', async () => {
            let balance = await nft.balanceOf(auction.address)
            assert.equal(balance, 1)
        })        
    })

    it('Start auction when not closed', async () => {
        try {
            await auction.createRound(TOKEN_URI)
            throw 'Can start auction but it is opened.'
        } catch (ex) { }
    })

    it(`Create bid ${BID}`, async () => {
        const tx = await auction.createBid({ value: BID })

        assert.equal(tx.logs[0].args.bidder, accounts[0])
        assert.equal(tx.logs[0].args.value, BID)
    })

    it('Can NOT create bid less current', async () => {
        try {
            await auction.createBid({ value: BID })
            throw 'Can vote twice.'
        }
        catch { }
    })

    it(`Create bid ${WINNER_BID}`, async () => {
        const tx = await auction.createBid({ value: WINNER_BID, from: WINNER })

        assert.equal(tx.logs[0].args.bidder, WINNER)
        assert.equal(tx.logs[0].args.value, WINNER_BID)
    })

    it('Span ROUND_TIME to close auction', async () => {
        await time.increase(ROUND_TIME)
    })

    it('Can get round info', async () => {
        const round = await auction.history(0)
        assert.equal(round != null, true)

        assert.equal(round.tokenId, 1)
        assert.equal(round.closed, false)
        assert.equal(round.bidders.length, 2)
        assert.equal(round.bidders[0], accounts[0])
        assert.equal(round.bidders[1], WINNER)        
        assert.equal(round.bids.length, 2)
        assert.equal(round.bids[0], BID)
        assert.equal(round.bids[1], WINNER_BID)
    })

    it('Can close auction', async () => {
        let can = await auction.canClose();
        assert.equal(can, true)
    })

    it('Close auction. Check DAO balance by the way', async () => {
        let balance = new BN(await web3.eth.getBalance(dao.address))

        const tx = await auction.close();

        let balanceAfter = new BN(await web3.eth.getBalance(dao.address))
        
        let diff = balanceAfter.sub(balance).toNumber()
        assert.equal(diff, WINNER_BID)

        assert.equal(tx.logs[0].args.round, 0)
        assert.equal(tx.logs[0].args.tokenId, 1)
        assert.equal(tx.logs[0].args.winner, WINNER)        
    })

    it('Token owned by winner now', async () => {
        let owner = await nft.ownerOf(1);
        assert.equal(owner, WINNER)
    })

    it(`Changing round time (and back)`, async () => {
        let time = await auction.round_time()
        await auction.set_round_time(new BN(time).toNumber() + 10)
        let timeAfter = await auction.round_time()
        assert.equal(new BN(timeAfter).sub(new BN(time)).toNumber(), 10)

        await auction.set_round_time(ROUND_TIME)
    })

    it(`Span some rounds till father turn`, async () => {
        let historyCount = await auction.historyCount()
        for (let i = historyCount; i < FATHER_PERIOD - 1; i++){
            let tx = await auction.createRound(TOKEN_URI)
            assert.equal(tx.logs[0].event, 'Open', "Events not mined")

            await time.increase(ROUND_TIME)
            tx = await auction.close()

            assert.equal(tx.logs[0].event, 'Close', "Events not mined")
            assert.equal(tx.logs[0].args.round.toNumber(), i, "Round in enevt not correct")
            // assert.equal(tx.logs[0].args.tokenId, 1)
            assert.equal(tx.logs[0].args.winner, all.zero_address)            
        }
    })

    it(`Father turn is ok`, async () => {
        let tx = await auction.createRound(TOKEN_URI)
        assert.equal(tx.logs[0].event, 'Open', "Events not mined")

        let historyCount = await auction.historyCount()
        let round = await auction.history(historyCount - 1)

        assert.equal(round.closed, false)
        assert.equal(round.winner, FATHER_ADDRESS)

        let canClose = await auction.canClose()
        assert.equal(canClose, true, "Father turn can be closed immidiately")

        tx = await auction.close()
        assert.equal(tx.logs[0].event, 'Close', "Events not mined")
        assert.equal(tx.logs[0].args.winner, FATHER_ADDRESS)

        let balance = await nft.balanceOf(FATHER_ADDRESS)
        assert.equal(balance, 1)
    })

    it(`Again span some rounds till father turn`, async () => {
        let historyCount = await auction.historyCount()
        for (let i = historyCount; i < FATHER_PERIOD * 2 - 1; i++){
            let tx = await auction.createRound(TOKEN_URI)
            assert.equal(tx.logs[0].event, 'Open', "Events not mined")

            await time.increase(ROUND_TIME)
            tx = await auction.close()

            assert.equal(tx.logs[0].event, 'Close', "Events not mined")
            assert.equal(tx.logs[0].args.round.toNumber(), i, "Round in enevt not correct")
            // assert.equal(tx.logs[0].args.tokenId, 1)
            assert.equal(tx.logs[0].args.winner, all.zero_address)            
        }
    })

    it(`And again Father turn is ok`, async () => {
        let tx = await auction.createRound(TOKEN_URI)
        assert.equal(tx.logs[0].event, 'Open', "Events not mined")

        let historyCount = await auction.historyCount()
        let round = await auction.history(historyCount - 1)

        assert.equal(round.closed, false)
        assert.equal(round.winner, FATHER_ADDRESS)

        let canClose = await auction.canClose()
        assert.equal(canClose, true, "Father turn can be closed immidiately")

        tx = await auction.close()
        assert.equal(tx.logs[0].event, 'Close', "Events not mined")
        assert.equal(tx.logs[0].args.winner, FATHER_ADDRESS)

        let balance = await nft.balanceOf(FATHER_ADDRESS)
        assert.equal(balance, 2)
    })    

})