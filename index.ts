export * from "./src/inventoryItem";
export * from "./src/warehouseItem";

export interface Contract {
    contractName: string;
    michelson: object[];
    source: string;
    compiler: {
        name: string;
        version: string;
    };
    schemaVersion: string;
    updatedAt: string;
}

const contracts = {
    warehouse: require("./warehouse.json"),
    inventory: require("./inventory.json")
} as {
    [k: string]: Contract;
};

export default contracts;
