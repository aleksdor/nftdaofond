// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/introspection/ERC165Checker.sol";

// Contract spawns NFT tokens and even n-th goes to fathers address.

interface IERC721 {
    function mint(address recepient, string memory uri) external returns (uint256);
}

/**
Contratc that controls NFT minting for auction and fathers account.
 */
contract RarinonNFTSpawn is Ownable {
    //Declare an Event
    event Deposit(address indexed _invoker, uint256 indexed _id, address indexed _receiver);

    IERC721 nft;  // Base NFT token for DAO voting.
    uint8 public till_father;
    uint8 public father_period;    
    uint256 public spawn_period;
    address public father; // Takes every n-th token
    address public son; // Takes all except n-th tokens
    uint256 public last_tick;

    constructor(address nft_, uint256 spawn_period_, address son_, address father_, uint8 father_period_) {
        require(nft_ != address(0), "nft can not be 0");
        require(ERC165Checker.supportsERC165(nft_), "address does not support IERC165");
        require(son_ != address(0), "son can not be 0");
        require(father_ != address(0), "father can not be 0");
        require(spawn_period_ > 0, "spawn_period must be greather 0");
        require(father_period_ > 1, "father_period must be greather 1");

        father_period = father_period_;
        till_father = father_period;
        nft = IERC721(nft_);
        spawn_period = spawn_period_;
        father = father_;
        son = son_;
    }

    function can_invoke() public view returns(bool){
        return block.timestamp - last_tick >= spawn_period ;
    }

    function invoke(string memory uri) public {
        require(can_invoke(), "Can not invoke yet");

        if (till_father <= 1){            
            till_father = father_period;
            uint256 id = nft.mint(father, uri);
            //Emit an event
            emit Deposit(msg.sender, id, father);        
        }
        else{
            till_father = till_father - 1;
            uint256 id = nft.mint(son, uri);
            //Emit an event
            emit Deposit(msg.sender, id, son);
        }        
    }
}
