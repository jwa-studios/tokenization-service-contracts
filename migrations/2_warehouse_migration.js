const Warehouse = artifacts.require("Warehouse");
const { MichelsonMap } = require("@taquito/taquito");

module.exports = async (deployer, _, accounts) => {
    deployer.deploy(Warehouse, MichelsonMap.fromLiteral({}),
    accounts[0].pkh, {
        overwrite: true
    })
}