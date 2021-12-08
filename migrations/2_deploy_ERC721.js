const ERC721 = artifacts.require("ERC721");

module.exports = function (deployer) {
  deployer.deploy(ERC721, "token1", "shmoken1");
};
