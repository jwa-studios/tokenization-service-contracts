const Inventory = artifacts.require("Inventory");
const { MichelsonMap } = require("@taquito/taquito");

module.exports = async (deployer, _, accounts) => {
    deployer.deploy(
        Inventory,
        {
            inventory: MichelsonMap.fromLiteral({})
        }
    );
};
