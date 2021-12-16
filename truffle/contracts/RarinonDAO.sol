// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "openzeppelin-solidity/contracts/access/Ownable.sol";

// Контракт собирает деньги в фонд и распределяет их голосованием.
// Голосование проводится главным NFT токеном.

interface IERC721 {
    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);
}

contract RarinonDAO is Ownable {
    IERC721 _nft;  // Base NFT token for DAO voting.
    uint256 public round_sec; // ROund length in seconds.
    uint32 public quorum; // How many votes nedded to accept or reject voting.

    struct Proposal{
        address account; // Адрес получателя
        uint256 amount; // Сумма к получению
        string title; // Название запроса (подайте на поправку здоровья)
        string url; // URL ресурса с доп информацией (http://тут-красивая-html-страница-попрошайки)
        address[] voters; // Адреса голосователей
        uint32 nyes; // Сколько голосов за
        uint32 nno; // Сколько голосов против
        uint256 end_at; // Когда закончится голосование
        bool closed; // Голосование закрыто
        bool approved; // Голосование принято (деньжульки отправлены попрошайке)
    }

    Proposal[] _history;

    function historyCount() public view returns (uint256){
        return _history.length;
    }

    function history(uint256 index) public view returns (Proposal memory){
        return _history[index];
    }

    constructor(address nft, uint256 round_sec_, uint32 quorum_) {
        _nft = IERC721(nft);
        round_sec = round_sec_;
        quorum = quorum_;
    }

    function set_round_sec(uint256 round_sec_) onlyOwner public {
        round_sec = round_sec_;
    }

    function set_quorum(uint32 quorum_) onlyOwner public {
        quorum = quorum_;
    }

    modifier onlyMember() {        
        require(_nft.balanceOf(msg.sender) > 0, "You need at least 1 NFT for actions.");
        _;
    }

    function didVote(address voter, uint256 vote_id) public view returns (bool) {
        require(vote_id < _history.length);
        Proposal memory proposal = _history[vote_id];
        for (uint256 i = 0; i < proposal.voters.length; i++){
            if (proposal.voters[i] == voter) return true;
        }
        return false;
    }

    // Добавить голосование.
    function addProposal(address account, uint256 amount, string memory title, string memory url) onlyMember public {
        require(address(this).balance >= amount, "Not sufficient funds");

        address[] memory dump;
        Proposal memory proposal = Proposal(account, amount, title, url, dump, 0, 0, block.timestamp + round_sec, false, false);
        _history.push(proposal);
    }

    //
    function voteYes(uint256 vote_id) onlyMember public {
        require(!didVote(msg.sender, vote_id), "Already voted");

        Proposal storage proposal = _history[vote_id];
        require(!proposal.closed, "Already closed");

        proposal.nyes = proposal.nyes + 1;
        proposal.voters.push(msg.sender);

        if (canClose(vote_id)) close(vote_id);
    }

    function voteNo(uint256 vote_id) onlyMember public {
        require(!didVote(msg.sender, vote_id), "Already voted");

        Proposal storage proposal = _history[vote_id];
        require(!proposal.closed, "Already closed");

        proposal.nyes = proposal.nno + 1;
        proposal.voters.push(msg.sender);

        if (canClose(vote_id)) close(vote_id);
    }

    function canClose(uint256 vote_id) public view returns (bool){
        require(vote_id < _history.length);
        Proposal memory proposal = _history[vote_id];

        return !proposal.closed && (proposal.nyes >= quorum || proposal.nno >= quorum || block.timestamp >= proposal.end_at);
    }

    function close(uint256 vote_id) public {
        require(canClose(vote_id));
        
        Proposal storage proposal = _history[vote_id];
        require(!proposal.closed, "Already closed");

        proposal.closed = true;

        // Quorum agreed proposal. Transfer money.
        if (proposal.nyes >= quorum){
            proposal.approved = true;
            payable(proposal.account).transfer(proposal.amount);
        }
    }

    // @notice Will receive any eth sent to the contract
    receive() external payable {}
}
