const Warehouse = artifacts.require("Warehouse");
const Wrapper = artifacts.require("Wrapper");

module.exports = async (deployer, _, accounts) => {
    deployer.deploy(
        Wrapper,
        Warehouse.address,
        accounts[0].pkh,
        {
            overwrite: true
        }
    )
};
