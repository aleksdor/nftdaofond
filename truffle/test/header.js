const BN = require('bn.js')

module.exports = {
    zero_address: "0x0000000000000000000000000000000000000000",

    abi: {
        RarinonNFT: artifacts.require("RarinonNFT"),
        RarinonDAO: artifacts.require("RarinonDAO"),
        RarinonAuction: artifacts.require("RarinonAuction"),
        RarinonSpawn: artifacts.require("RarinonNFTSpawn")
    }
}

// const Migra = artifacts.require("Migrations")




