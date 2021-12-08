// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

// Контракт собирает деньги в фонд и распределяет их голосованием.
// Голосование проводится главным NFT токеном.

interface IERC721 {
    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);
}

contract RarinonDAO {
    IERC721 _nft;  // Base NFT token for DAO voting.
    uint256 _round_sec; // ROund length in seconds.
    uint32 _quorum; // How many votes nedded to accept or reject voting.

    struct Proposal{
        address recepinet;
        uint256 amount;
        string title;
        string url;
        address[] voters;
        uint32 nyes;
        uint32 nno;
        uint256 end_at;
        bool closed;
    }

    Proposal[] public history;

    constructor(address nft, uint256 round_sec, uint8 quorum) {
        _nft = IERC721(nft);
        _round_sec = round_sec;
        _quorum = quorum;
    }

    modifier onlyMember() {        
        require(_nft.balanceOf(msg.sender) > 0, "You need at least 1 NFT for actions.");
        _;
    }

    function didVote(address voter, uint256 vote_id) public view returns (bool) {
        require(vote_id < history.length);
        Proposal memory proposal = history[vote_id];
        for (uint256 i = 0; i < proposal.voters.length; i++){
            if (proposal.voters[i] == voter) return true;
        }
        return false;
    }

    // Добавить голосование.
    function addProposal(address recepinet, uint256 amount, string memory title, string memory url) onlyMember public {
        require(address(this).balance >= amount, "Not sufficient funds");

        address[] memory dump;
        Proposal memory proposal = Proposal(recepinet, amount, title, url, dump, 0, 0, block.timestamp + _round_sec, false);
        history.push(proposal);
    }

    //
    function voteYes(uint256 vote_id) onlyMember public {
        require(!didVote(msg.sender, vote_id), "Already voted");

        Proposal storage proposal = history[vote_id];
        proposal.voters.push(msg.sender);

        if (canClose(vote_id)) close(vote_id);
    }

    function voteNo(uint256 vote_id) onlyMember public {
        require(!didVote(msg.sender, vote_id), "Already voted");

        Proposal storage proposal = history[vote_id];
        proposal.voters.push(msg.sender);

        if (canClose(vote_id)) close(vote_id);
    }

    function canClose(uint256 vote_id) public view returns (bool){
        require(vote_id < history.length);
        Proposal memory proposal = history[vote_id];

        return proposal.nyes >= _quorum || proposal.nno >= _quorum || block.timestamp >= proposal.end_at;        
    }

    function close(uint256 vote_id) public {
        require(canClose(vote_id));
        
        Proposal memory proposal = history[vote_id];
        require(!proposal.closed, "Already closed");

        proposal.closed = true;

        // Quorum agreed proposal. Transfer money and close proposal.
        if (proposal.nyes >= _quorum){
             payable(proposal.recepinet).transfer(proposal.amount);
        }
    }

    // @notice Will receive any eth sent to the contract
    receive() external payable {}
}
