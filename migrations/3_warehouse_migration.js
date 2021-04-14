const Warehouse = artifacts.require("Warehouse");
const { MichelsonMap } = require("@taquito/taquito");

module.exports = async (deployer, _, accounts) => {
    deployer.deploy(
        Warehouse,
        {
            owner: accounts[0],
            version: "1",
            warehouse: MichelsonMap.fromLiteral({})
        },
        accounts[0].pkh,
        {
            overwrite: true
        }
    );
};
