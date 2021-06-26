export * from "./src/inventoryItem";
export * from "./src/warehouseItem";

export interface Contract {
    contractName: string;
    michelson: object[];
}

const contracts = {
    warehouse: {
        contractName: "Warehouse",
        michelson: require("./warehouse.json")
    },
    inventory: {
        contractName: "Inventory",
        michelson: require("./inventory.json")
    }
} as {
    [k: string]: Contract;
};

export default contracts;
