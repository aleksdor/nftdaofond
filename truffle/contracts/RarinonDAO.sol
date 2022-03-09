// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/introspection/ERC165Checker.sol";

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
    uint256 public vote_period; // vote_id length in seconds.
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

    event Open(uint256 indexed vote_id, address indexed author);
    event Vote(uint256 indexed vote_id, address indexed voter, bool indexed yes);
    event Close(uint256 indexed vote_id, bool indexed approved);

    mapping(address => bool) _keepers;

    constructor(address nft, uint256 vote_period_, uint32 quorum_, address[] memory keepers) {
        require(nft != address(0), "nft can not be 0");
        require(ERC165Checker.supportsERC165(nft), "address does not support IERC165");
        require(vote_period_ > 0, "vote_period_ must be greather 0");
        require(quorum_ > 1, "quorum must be greather 1");

        _nft = IERC721(nft);
        vote_period = vote_period_;
        quorum = quorum_;

        for (uint8 i = 0; i < keepers.length; i++)
            _keepers[keepers[i]] = true;
    }

    function is_keeper(address adr) public view returns(bool){
        return _keepers[adr];
    }

    function historyCount() public view returns (uint256){
        return _history.length;
    }

    function history(uint256 index) public view returns (Proposal memory){
        return _history[index];
    }

    function set_vote_period(uint256 vote_period_) onlyOwner public {
        vote_period = vote_period_; 
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
        require(_nft.balanceOf(msg.sender) > 1, "You need at least 2 NFT for actions.");
        require(address(this).balance >= amount, "Not sufficient funds");

        address[] memory dump;
        Proposal memory proposal = Proposal(account, amount, title, url, dump, 0, 0, block.timestamp + vote_period, false, false);
        _history.push(proposal);

        emit Open(_history.length - 1, msg.sender);
    }

    //
    function vote(uint256 vote_id, bool yes) onlyMember public {
        require(!didVote(msg.sender, vote_id), "Already voted");

        Proposal storage proposal = _history[vote_id];
        require(!proposal.closed, "Already closed");

        proposal.voters.push(msg.sender);

        if (yes){
            proposal.nyes = proposal.nyes + 1;
        }
        else
        {
            proposal.nno = proposal.nno + 1;
        }

        emit Vote(vote_id, msg.sender, yes);

        if (canClose(vote_id)) close(vote_id);
    }

    // Keeper function to decline voting immidiately.
    function decline(uint256 vote_id) public {
        require(is_keeper(msg.sender), "Only keeper can decline voting");
        _close(vote_id, false);        
    }

    function canClose(uint256 vote_id) public view returns (bool){
        require(vote_id < _history.length);
        Proposal memory proposal = _history[vote_id];

        return !proposal.closed && (proposal.nyes >= quorum || proposal.nno >= quorum || block.timestamp >= proposal.end_at);
    }

    function close(uint256 vote_id) public {
        require(canClose(vote_id));
        Proposal memory proposal = _history[vote_id];
        _close(vote_id, proposal.nyes >= quorum);
    }

    function _close(uint256 vote_id, bool approved) private {
        Proposal storage proposal = _history[vote_id];
        require(!proposal.closed, "Already closed");
        
        proposal.closed = true;

        if (approved) {
            proposal.approved = true;
            payable(proposal.account).transfer(proposal.amount);
        }

        emit Close(vote_id, proposal.approved);
    }

    // @notice Will receive any eth sent to the contract
    receive() external payable {}
}
