const { TezosToolkit, MichelsonMap } = require("@taquito/taquito");
const { InMemorySigner } = require("@taquito/signer");

const warehouseContract = require("../build/contracts/warehouse.json");
const inventoryContract = require("../build/contracts/inventory.json");

const Tezos = new TezosToolkit("http://localhost:20000");
Tezos.setProvider({
    signer: new InMemorySigner(
        "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq"
    )
});

const context = {};

async function originateWarehouse() {
    const originationOp = await Tezos.contract.originate({
        code: warehouseContract,
        storage: {
            owner: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
            version: "1",
            warehouse: MichelsonMap.fromLiteral({})
        }
    });

    context.warehouseAddress = originationOp.contractAddress;

    await originationOp.confirmation(1, 1);
}

async function originateInventory() {
    const originationOp = await Tezos.contract.originate({
        code: inventoryContract,
        storage: MichelsonMap.fromLiteral({})
    });

    context.inventoryAddress = originationOp.contractAddress;

    await originationOp.confirmation(1, 1);
}

async function originateWarehouseItem(...item) {
    const contract = await Tezos.contract.at(context.warehouseAddress);

    const originationOp = await contract.methods.add_item(...item).send();

    await originationOp.confirmation(1, 1);
}

async function updateWarehouseItem(...item) {
    const contract = await Tezos.contract.at(context.warehouseAddress);

    const originationOp = await contract.methods.update_item(...item).send();

    await originationOp.confirmation(1, 1);
}

async function transferWarehouseItem(item_id, instance_id) {
    const contract = await Tezos.contract.at(context.warehouseAddress);

    const originationOp = await contract.methods
        .assign_item_proxy(context.inventoryAddress, item_id, instance_id)
        .send();

    await originationOp.confirmation(1, 1);
}

async function estimateCost(name, operation) {
    const balanceBefore = await Tezos.tz.getBalance(
        "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb"
    );

    await operation();

    const balanceAfter = await Tezos.tz.getBalance(
        "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb"
    );
    console.log(
        name,
        `${(balanceBefore.toNumber() - balanceAfter.toNumber()) / 1000000}ꜩ`
    );
}

(async function run() {
    try {
        await estimateCost("warehouse origination cost", originateWarehouse);

        await estimateCost("inventory origination cost", originateInventory);

        await estimateCost(
            "create warehouse item cost",
            originateWarehouseItem.bind(
                null,
                10,
                MichelsonMap.fromLiteral({
                    XP: "97"
                }),
                0,
                "Karim Benzema",
                undefined,
                10
            )
        );

        await estimateCost(
            "Update same size warehouse item cost",
            updateWarehouseItem.bind(
                null,
                10,
                MichelsonMap.fromLiteral({
                    XP: "10"
                }),
                0,
                "Same length ~",
                undefined,
                10
            )
        );

        await estimateCost(
            "Update smaller size warehouse item cost",
            updateWarehouseItem.bind(
                null,
                10,
                MichelsonMap.fromLiteral({}),
                0,
                "Same",
                undefined,
                10
            )
        );

        await estimateCost(
            "Update bigger size warehouse item cost",
            updateWarehouseItem.bind(
                null,
                10,
                MichelsonMap.fromLiteral({
                    XP: "10",
                    CLUB: "real madrid"
                }),
                0,
                "this is a much bigger item or at least a bit bigger",
                undefined,
                10
            )
        );

        await estimateCost(
            "Transfer item to inventory",
            transferWarehouseItem.bind(null, 0, 1)
        );
    } catch (err) {
        console.log(err);
    }
})();
