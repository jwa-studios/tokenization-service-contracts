const fs = require("fs");

const distFolder = "./dist";
const contractsFolder = "./build/contracts";

const warehouseContractJSON = JSON.parse(
    String(fs.readFileSync(`${contractsFolder}/Warehouse.json`))
);

if (!fs.existsSync(distFolder)) {
    fs.mkdirSync(distFolder);
}

fs.writeFileSync(
    `${distFolder}/warehouse.json`,
    stringifiedContract(warehouseContractJSON)
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
