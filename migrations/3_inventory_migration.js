const Inventory = artifacts.require("Inventory");
const { MichelsonMap } = require("@taquito/taquito");

module.exports = async (deployer, _, accounts) => {
    deployer.deploy(
        Inventory,
        {
            originator: accounts[0],
            owner: accounts[0],
            inventory: MichelsonMap.fromLiteral({})
        },
        accounts[0],
        {
            overwrite: true
        }
    );
};
