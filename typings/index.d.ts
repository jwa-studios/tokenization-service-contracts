const contracts: {
    [k: string]: Contract;
};

interface Contract {
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

export default contracts;
