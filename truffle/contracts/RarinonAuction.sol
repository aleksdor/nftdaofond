// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/introspection/ERC165Checker.sol";

// Контракт собирает деньги в фонд и распределяет их голосованием.
// Голосование проводится главным NFT токеном.

interface IERC721 {
    function mint(address recepient, string memory uri) external returns (uint256);
    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) external view returns (address);

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

contract RarinonAuction is Ownable {
    struct Round{
        uint256 tokenId;
        uint256 end_at;
        bool closed;
        address[] bidders;
        uint256[] bids;
        address winner;
    }

    IERC721 nft;  // Base NFT token for DAO voting.
    address public dao;
    uint256 public round_time; // Round length in seconds.
    uint8 public father_period;    
    address public father; // Takes every n-th token
    uint8 public till_father;

    Round[] _history;

    event Open(uint256 indexed round, uint256 indexed tokenId, uint256 indexed end_at);
    event Bid(address indexed bidder, uint256 indexed value);
    event Close(uint256 indexed round, uint256 indexed tokenId, address winner);

    function historyCount() public view returns (uint256){
        return _history.length;
    }

    function history(uint256 index) public view returns (Round memory){
        return _history[index];
    }

    constructor(address nft_, address dao_, uint256 round_time_, address father_, uint8 father_period_) {
        require(nft_ != address(0), "nft can not be 0");
        require(ERC165Checker.supportsERC165(nft_), "address does not support IERC165");
        require(dao_ != address(0), "dao can not be 0");
        require(round_time_ > 0, "round_time must be greather 0");
        require(father_ != address(0), "father can not be 0");
        require(father_period_ > 1, "father_period must be greather 1");

        nft = IERC721(nft_);
        dao = dao_;
        round_time = round_time_;
        father = father_;
        father_period = father_period_;

        till_father = father_period;
    }

    function set_round_time(uint256 round_time_) onlyOwner public {
        require(round_time_ > 0, "round_time must be greather 0");
        round_time = round_time_;
    }

    function set_dao(address dao_) onlyOwner public {
        require(dao_ != address(0), "dao can not be 0");
        dao = dao_;
    }

    /**
    Create new auction round (mint token with uri and starts play).
    Even father_period token goes to father. If so round restarts immidiately.
     */
    function createRound(string memory uri) public {
        require(_history.length == 0 || _history[_history.length - 1].closed, "Auction in progress");        
        uint256 tokenId;
        address[] memory bidders;
        uint256[] memory bids;
        Round memory round;
        uint256 end_at = block.timestamp + round_time;
        address winner = address(0);

        tokenId = nft.mint(address(this), uri);

        if (till_father <= 1){            
            till_father = father_period;
            winner = father;
            end_at = block.timestamp;
        }
        else{
            till_father = till_father - 1;
        }

        round = Round(tokenId, end_at, false, bidders, bids, winner);
        _history.push(round);

        emit Open(_history.length - 1, tokenId, end_at);
    }

    function createBid() payable public {
        Round storage round = _history[_history.length - 1];
        uint256 currentBid = round.bids.length > 0 ? round.bids[round.bids.length - 1] : 0;
        uint256 nextBid = currentBid * 13 / 10;
        require(msg.value > nextBid, "Bid is too low.");
        
        round.bidders.push(msg.sender);
        round.bids.push(msg.value);

        // If there was another bidder, send him back his bid.
        if (round.bidders.length > 1){
            uint256 index = round.bids.length;
            payable(round.bidders[index - 2]).transfer(round.bids[index - 2]);
        }

        emit Bid(msg.sender, msg.value);
    }

    function canClose() public view returns (bool){
        Round storage round = _history[_history.length - 1];

        return !round.closed && block.timestamp >= round.end_at;        
    }

    function close() public {
        require(canClose(), "Can not close auction now.");
        Round storage round = _history[_history.length - 1]; 

        round.closed = true;

        // Has winner. Transfer token him. Transfer all money to dao.
        if (round.bidders.length > 0){
            payable(dao).transfer(address(this).balance);
            round.winner = round.bidders[round.bidders.length - 1];            
        }
        // No winners. Just burn token.
        if (round.winner == address(0)) {
            nft.burn(round.tokenId);
        }
        else {
            nft.safeTransferFrom(address(this), round.winner, round.tokenId);
        }
        emit Close(_history.length - 1, round.tokenId, round.winner);
    }    

    // @notice Will receive any eth sent to the contract
    receive() external payable {}
}
