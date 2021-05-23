const { TezosToolkit, MichelsonMap } = require("@taquito/taquito");
const { InMemorySigner } = require("@taquito/signer");

const inventoryContract = require("../build/contracts/inventory.json");
const warehouseContract = require("../build/contracts/warehouse.json");

const {
    warehouseItemToObject,
    getInventoryItemAt,
    originateContract
} = require("./utils");

describe("Given Warehouse and Inventory are deployed", () => {
    let warehouseInstance;
    let inventoryInstance;
    let tezos;

    beforeAll(async () => {
        tezos = new TezosToolkit("http://localhost:20000");

        tezos.setProvider({
            signer: new InMemorySigner(
                "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq"
            )
        });

        warehouseInstance = await originateContract(tezos, warehouseContract, {
            owner: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
            version: "1",
            warehouse: MichelsonMap.fromLiteral({})
        });

        inventoryInstance = await originateContract(
            tezos,
            inventoryContract,
            MichelsonMap.fromLiteral({})
        );
    });

    describe("When I add a new item with a quantity of 1", () => {
        beforeAll(async () => {
            const operation = await warehouseInstance.methods
                .add_item(
                    1,
                    MichelsonMap.fromLiteral({
                        XP: "97"
                    }),
                    9,
                    "Karim Benzema",
                    undefined,
                    1
                )
                .send();

            await operation.confirmation(1);
        });

        describe("And I assign it to an inventory", () => {
            let inventoryStorage;
            let warehouseStorage;

            beforeAll(async () => {
                const operation = await warehouseInstance.methods
                    .assign_item_proxy(inventoryInstance.address, 9, 1)
                    .send();

                await operation.confirmation(1);

                inventoryStorage = await inventoryInstance.storage();
                warehouseStorage = await warehouseInstance.storage();
            });

            it("Then assigns the item to the inventory AND the data field is empty", async () => {
                const obj = await getInventoryItemAt(inventoryStorage, 9, 1);

                expect(obj).toEqual({
                    data: {}
                });
            });

            it("Then decrements the available quantity for the item", async () => {
                const item = await warehouseStorage.warehouse.get("9");

                const obj = warehouseItemToObject(item);

                expect(obj).toEqual({
                    available_quantity: 0,
                    data: {
                        XP: "97"
                    },
                    item_id: 9,
                    name: "Karim Benzema",
                    no_update_after: undefined,
                    total_quantity: 1
                });
            });

            describe("When I assign the item again", () => {
                it("Then fails since there are no available items anymore", async () => {
                    try {
                        const operation = await warehouseInstance.methods
                            .assign_item_proxy(inventoryInstance.address, 9, 1)
                            .send();

                        console.error(
                            "Will fail: Assign_item_proxy should throw an error since the available_quantity is 0n"
                        );

                        fail(
                            "Assign_item_proxy should throw an error if the available_quantity is 0n"
                        );
                    } catch (err) {
                        expect(err.message).toEqual("NO_AVAILABLE_ITEM");
                    }
                });
            });
        });

        describe("When I assign an item to an inventory that doesn't exist", () => {
            beforeAll(async () => {
                const operation = await warehouseInstance.methods
                    .add_item(
                        1,
                        MichelsonMap.fromLiteral({
                            XP: "0"
                        }),
                        20,
                        "An Item",
                        undefined,
                        1
                    )
                    .send();

                await operation.confirmation(1);
            });

            it("Then fails with an explicit error", async () => {
                try {
                    const operation = await warehouseInstance.methods
                        .assign_item_proxy(
                            "KT1CKvaBW4kzvxChQpbG9GQPTiwtVX6kj1WY",
                            20,
                            1
                        )
                        .send();

                    await operation.confirmation(1);

                    console.error(
                        "Will fail: Assign_item_proxy should throw an error since the inventory contract doesn't exist"
                    );

                    fail(
                        "Assign_item_proxy should throw an error if the contract doesn't exist"
                    );
                } catch (err) {
                    expect(err.message).toEqual("CONTRACT_NOT_FOUND");
                }
            });
        });
    });
});
