const fs = require("fs");

const distFolder = "./dist";
const contractsFolder = "./build/contracts";

const warehouseContractJSON = JSON.parse(
    String(fs.readFileSync(`${contractsFolder}/Warehouse.json`))
);

const inventoryContractJSON = JSON.parse(
    String(fs.readFileSync(`${contractsFolder}/Inventory.json`))
);

if (!fs.existsSync(distFolder)) {
    fs.mkdirSync(distFolder);
}

fs.writeFileSync(
    `${distFolder}/warehouse.json`,
    stringifiedContract(warehouseContractJSON)
);

fs.writeFileSync(
    `${distFolder}/inventory.json`,
    stringifiedContract(inventoryContractJSON)
);

function stringifiedContract(contractJSON) {
    return JSON.stringify({
        contractName: contractJSON.contractName,
        michelson: JSON.parse(contractJSON.michelson),
        source: contractJSON.source,
        compiler: contractJSON.compiler,
        schemaVersion: contractJSON.schemaVersion,
        updatedAt: contractJSON.updatedAt
    });
}
