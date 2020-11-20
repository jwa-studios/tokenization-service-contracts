const Warehouse = artifacts.require("Warehouse");
const { MichelsonMap } = require("@taquito/taquito");

module.exports = async (deployer, _, accounts) => {
    deployer.deploy(Warehouse, {
        stuff: 0,
        warehouse: MichelsonMap.fromLiteral({})
    },
    accounts[0].pkh, {
        overwrite: true
    })
}