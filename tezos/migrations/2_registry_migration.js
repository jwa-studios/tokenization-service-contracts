const Registry = artifacts.require("Registry");
const { MichelsonMap } = require("@taquito/taquito");

module.exports = async (deployer, _, accounts) => {
    deployer.deploy(Registry, {
        last_token_id: 0,
        registry: MichelsonMap.fromLiteral({})
    },
    accounts[0].pkh, {
        overwrite: true
    })
}