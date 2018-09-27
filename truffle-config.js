var HDWalletProvider = require("truffle-hdwallet-provider");
var MNEMONIC = "job oil wood vocal valid borrow kit barely sock south silk guess";
var ENDPOINT = "https://rinkeby.infura.io/v3/249e1e028e8d433196a2b7e7e1a69ff9";

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*", // Match any network id

        },
        rinkeby: {
            provider: function() {
                return new HDWalletProvider(MNEMONIC, ENDPOINT)
            },
            network_id: 4,
            gas: 4500000,
            gasPrice: 10000000000,
        }
    }
};