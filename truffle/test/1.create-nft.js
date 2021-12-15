// const Migra = artifacts.require("Migrations")
const BN = require('bn.js')

const RarinonNFT = artifacts.require("RarinonNFT")
const RarinonDAO = artifacts.require("RarinonDAO")
const RarinonAuction = artifacts.require("RarinonAuction")


const advanceBlockAtTime = (time) => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send(
        {
          jsonrpc: "2.0",
          method: "evm_mine",
          params: [time],
          id: new Date().getTime(),
        },
        (err, _) => {
          if (err) {
            return reject(err);
          }
          const newBlockHash = web3.eth.getBlock("latest").hash;
  
          return resolve(newBlockHash);
        },
      );
    });
  };





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

        await dao.voteYes(0, {from: accounts[1]})

        let balanceAfter = new BN(await web3.eth.getBalance(acc))

        let diff = balanceAfter.sub(balance).toNumber()
        assert.equal(diff, history0.amount)        
    })

    it(`Can NOT vote on closed proposal`, async () => {
        try {
            await dao.voteYes(0, {from: accounts[2]})
            await dao.voteYes(0, {from: accounts[3]})
            await dao.voteYes(0, {from: accounts[4]})
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


describe('RarinonAuction', () => {
    let nft, dao, auction
    let accounts;

    let WINNER;
    const BID = 10;
    const WINNER_BID = 50;

    it('getting addresses', async () => {
        accounts = await web3.eth.getAccounts()
        WINNER = accounts[5]
    })

    it('create nft', async () => {
        nft = await RarinonNFT.new("RarinonTest", "RNT")
    })

    it('create rarinon DAO', async () => {
        dao = await RarinonDAO.new(nft.address, 30, 2)
    })

    it('create rarinon Auction', async () => {
        auction = await RarinonAuction.new(nft.address, dao.address, 5)
    })
    
    it('Mint 1 token to auction', async () => {
        await nft.mint(auction.address, 'Some url')        
    })

    it('Start auction for last minted token', async () => {
        let tokenId = await nft.CurrentID()
        await auction.createRound(tokenId)
    })

    it(`Create bid ${BID}`, async () => {
        await auction.createBid({value: BID})
    })

    it('Can NOT create bid less current', async () => {
        try {
            await auction.createBid({value: BID})
            throw 'Can vote twice.'
        }
        catch { }        
    })

    it(`Create bid ${WINNER_BID}`, async () => {
        await auction.createBid({value: 50, from: WINNER})
    })

    it('Span 30 sec to close auction', async () => {
        let timestamp = new BN((await web3.eth.getBlock("latest")).timestamp);
        await advanceBlockAtTime(timestamp.toNumber() + 30);
    })

    it('Can get round info', async () => {
        let round = await auction.history(0)
        assert.equal(round != null, true)
    })

    it('Can close auction', async () => {
        let can = await auction.canClose();
        assert.equal(can, true)
    })

    it('Close auction. Check DAO balance by the way', async () => {
        let balance = new BN(await web3.eth.getBalance(dao.address))

        await auction.close();

        let balanceAfter = new BN(await web3.eth.getBalance(dao.address))

        let diff = balanceAfter.sub(balance).toNumber()
        assert.equal(diff, WINNER_BID)
    })   

    it('Token owned by winner now', async () => {
        let owner = await nft.ownerOf(1);        
        assert.equal(owner, WINNER)
    })   

    it(`changing round time`, async () => {
        let time = await dao.round_sec()
        await dao.set_round_sec(new BN(time).toNumber() + 10)
        let timeAfter = await dao.round_sec()
        assert.equal(new BN(timeAfter).sub(new BN(time)).toNumber(), 10) 
    })

})