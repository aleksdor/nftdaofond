// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

// Контракт собирает деньги в фонд и распределяет их голосованием.
// Голосование проводится главным NFT токеном.

interface IERC721 {
    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Destroys `tokenId`.
     * The approval is cleared when the token is burned.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     *
     * Emits a {Transfer} event.
     */
    function burn(uint256 tokenId) external;
}

contract RarinonAuction {
    struct Round{
        uint256 tokenId;
        uint256 end_at;
        bool closed;
        address[] bidders;
        uint256[] bids;
    }

    IERC721 nft;  // Base NFT token for DAO voting.
    address dao;
    uint256 round_sec; // Round length in seconds.

    Round[] history;

    constructor(address nft_, address dao_, uint256 round_sec_) {
        nft = IERC721(nft_);
        dao = dao_;
        round_sec = round_sec_;
    }

    function createRound(uint256 tokenId) public {
        require(history.length == 0 || history[history.length - 1].closed, "Auction in progress");

        address[] memory bidders;
        uint256[] memory bids;
        Round memory round = Round(tokenId, block.timestamp + round_sec, false, bidders, bids);
        history.push(round);
    }

    function createBid() payable public {
        Round storage round = history[history.length - 1];
        uint256 currentBid = round.bids.length > 0 ? round.bids[round.bids.length - 1] : 0;
        uint256 nextBid = currentBid * 13 / 10;
        require(msg.value > nextBid, "Bid is too low.");
        
        round.bidders.push(msg.sender);
        round.bids.push(msg.value);

        // If there was another bidder, send him back his bid.
        if (round.bidders.length > 2){
            uint256 index = round.bids.length;
            payable(round.bidders[index - 2]).transfer(round.bids[index - 2]);
        }
    }

    function canClose() public view returns (bool){
        Round memory round = history[history.length - 1];

        return !round.closed && block.timestamp >= round.end_at;        
    }

    function close() public {
        require(canClose(), "Can not close auction now.");
        Round memory round = history[history.length - 1];

        round.closed = true;

        // Has winner. Transfer token him. Transfer all money to dao.
        if (round.bidders.length > 0){
            nft.safeTransferFrom(address(this), round.bidders[round.bidders.length - 1], round.tokenId);
            payable(dao).transfer(address(this).balance);
        }
        // No winners. Just burn token.
        else
        {
            nft.burn(round.tokenId);
        }
    }    

    // @notice Will receive any eth sent to the contract
    receive() external payable {}
}
