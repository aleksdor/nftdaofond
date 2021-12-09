// contracts/GameItem.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/utils/Counters.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract RarinonNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => string) tokensURI;
    uint256 public CurrentID;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) { }

    /**
        Award NFT to player.
    */
    function mint(address recepient, string memory uri) onlyOwner public returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recepient, newItemId);
        tokensURI[newItemId] = uri;

        CurrentID = newItemId;
        return newItemId;
    }

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
    function burn(uint256 tokenId) public virtual {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _burn(tokenId);
    }    

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory)
    {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token" );
        return tokensURI[tokenId];
    }

    // function getT
}
