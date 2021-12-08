DAO system build on top of the NFT infrastructure.

How it works (for geeks)

First of all we needs to deploy contracts.

1. Deploy contract RarinonNFT(name, symbol), got nft_address.
name - name of the token as you wish
symbol - symbol of the token as you wish

2. Deploy contract RarinonDAO(nft_address, round_sec, quorum), got dao_address.
nft_address - address of nft token to govern DAO (erc721 contract)
round_sec - time of voting round in seconds (when elapsed proposal declines if no positive quorum)
quorum - how many votes nedded to accept/decline proposal.

3. Deploy contract RarinonAuction(nft_address, dao_address, round_sec), got auction_address.
nft_address - address of nft token to manage nft (erc721 contract)
dao_address - address of the DAO contract keeping treasure.
round_sec - auction length in seconds

Now we can deploy tokens. To deploy NFT token we should upload some information on ipfs.
1. Token image
2. Token json manifest
As a result we will get an IPFS address of our token.


Then we can play auction collecting treasure and distributing government.
For this section you need a bot to call your system checks. Such steps marked (bot).
But if you a strong you can call them by nands.

1. Deploy token info to ipfs.

2. Deploy token to Auction
nft.mint(auction_address, token_uri)
auction_address - address of auction contract
token_uri - IPFS address of token

3. Get created token id
nft.CurrentID, got token_id

4. Start auction for the token. Only one active auction allowed
auction.createRound(token_id)

5. Create bid for token. Users do that using metamask or another wallets.
auction.createBid() payable

6. Wait till auction ends asking canclose, canclose, canclose...
auction.canClose()

7. When true, close auction. Transfer or burn token happens here.
auction.close()

8. Now can create another token and trade it.

* You can get public array History and History[History.length - 1] to get all 
info about current auction including end time (end_at).


After trading some tokens and collection treasure we can distribute them by members voting.

1. First create proposal.
dao.addProposal(recepinet, amount, title, url)
recepinet - address for nivesting
amount - investment amount
title - invetment title (short text)
url - url of the page (in ipfs or public domain) describing purpose of invesment.

All proposals keeps in history array. We can check it all and get active (closed = false).
For active proposals we can vote yes or no (accept or decline proposal).
2a. Vote yes. Users do it from metamask.
dao.voteYes(proposal_index)
proposal_index - index of proposal

2b. Vote no. Users do it from metamask.
dao.voteNo(proposal_index)
proposal_index - index of proposal

3. Time by time we check proposals which ends but not closed using hostory
dao.canClose(proposal_index)
proposal_index - index of proposal

4. And when we can we do
dao.close(proposal_index)
proposal_index - index of proposal

Transferring money if approved by voting happens here.

We can create as many proposal as we want in one time. 
But if treasure will be not enough when proposal approves it will not receive money.